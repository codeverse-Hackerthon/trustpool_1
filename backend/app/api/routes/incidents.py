"""Phase 9 — Incidents API.

Endpoints:
  POST   /incidents
  GET    /incidents
  GET    /incidents/me
  GET    /incidents/{incident_id}
  GET    /incidents/owner/me
  GET    /incidents/admin/all
  PATCH  /incidents/{incident_id}/status
  POST   /incidents/{incident_id}/evidence
  POST   /incidents/{incident_id}/resolve
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import AliasChoices, BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, require_roles
from app.core.database import get_db
from app.models.booking import Booking
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentType
from app.models.resource import Resource
from app.models.user import User, UserRole
from app.services.audit_service import log_audit_event
from app.services.notification_service import notify_incident_reported, notify_incident_updated
from app.services.storage import upload_image

router = APIRouter(prefix="/incidents", tags=["Incidents"])


class IncidentIn(BaseModel):
    resource_id: uuid.UUID = Field(validation_alias=AliasChoices("resource_id", "resourceId"))
    booking_id: uuid.UUID | None = Field(None, validation_alias=AliasChoices("booking_id", "bookingId"))
    incident_type: str = Field(validation_alias=AliasChoices("incident_type", "type"))
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=10000)
    severity: str | IncidentSeverity

    def parsed_type(self) -> str:
        t = self.incident_type.upper()
        mapping = {
            "LATE_RETURN": "LATE_RETURN",
            "DAMAGE": "DAMAGE",
            "MISSING_ITEM": "MISSING_EQUIPMENT",
            "MISSING_EQUIPMENT": "MISSING_EQUIPMENT",
            "SAFETY_ISSUE": "SAFETY_ISSUE",
            "MISUSE": "MISUSE",
            "OTHER": "OTHER",
        }
        return mapping.get(t, "OTHER")

    def parsed_severity(self) -> IncidentSeverity:
        if isinstance(self.severity, IncidentSeverity):
            return self.severity
        try:
            return IncidentSeverity(self.severity.upper())
        except ValueError:
            return IncidentSeverity.LOW


class IncidentStatusUpdate(BaseModel):
    status: str | IncidentStatus
    notes: str | None = Field(None, max_length=5000, validation_alias=AliasChoices("notes", "resolutionNotes"))
    trustPenaltyApplied: int | None = None

    def parsed_status(self) -> IncidentStatus:
        if isinstance(self.status, IncidentStatus):
            return self.status
        s = self.status.upper()
        mapping = {
            "OPEN": IncidentStatus.OPEN,
            "INVESTIGATING": IncidentStatus.UNDER_REVIEW,
            "UNDER_REVIEW": IncidentStatus.UNDER_REVIEW,
            "RESOLVED": IncidentStatus.RESOLVED,
            "DISMISSED": IncidentStatus.DISMISSED,
        }
        return mapping.get(s, IncidentStatus.OPEN)


class IncidentResolve(BaseModel):
    resolution_notes: str = Field(min_length=1, max_length=5000, validation_alias=AliasChoices("resolution_notes", "resolutionNotes"))


def _serialize(i: Incident, db: Session | None = None) -> dict:
    res = db.get(Resource, i.resource_id) if db and i.resource_id else None
    reporter = db.get(User, i.reported_by) if db and i.reported_by else None

    # Map backend enum to frontend friendly strings
    status_lower = i.status.value.lower()
    if status_lower == "under_review":
        status_lower = "investigating"

    type_lower = i.incident_type.lower()
    if type_lower == "missing_equipment":
        type_lower = "missing_item"

    return {
        "id": str(i.id),
        "booking_id": str(i.booking_id) if i.booking_id else None,
        "bookingId": str(i.booking_id) if i.booking_id else None,
        "resource_id": str(i.resource_id),
        "resourceId": str(i.resource_id),
        "resourceTitle": res.name if res else "Resource",
        "reported_by": str(i.reported_by),
        "reportedById": str(i.reported_by),
        "reportedByName": reporter.full_name if reporter else "Reporter",
        "reportedByRole": reporter.role.value.lower() if reporter else "student",
        "assigned_admin_id": str(i.assigned_admin_id) if i.assigned_admin_id else None,
        "incident_type": i.incident_type,
        "type": type_lower,
        "title": i.title,
        "description": i.description,
        "evidence_urls": i.evidence_urls or [],
        "evidenceUrls": i.evidence_urls or [],
        "severity": i.severity.value,
        "severity_lower": i.severity.value.lower(),
        "status": i.status.value,
        "status_lower": status_lower,
        "resolution_notes": i.resolution_notes,
        "resolutionNotes": i.resolution_notes,
        "ai_summary": i.ai_summary,
        "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
        "resolvedAt": i.resolved_at.isoformat() if i.resolved_at else None,
        "created_at": i.created_at.isoformat(),
        "createdAt": i.created_at.isoformat(),
        "updated_at": i.updated_at.isoformat(),
    }


@router.get("")
def list_incidents(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    """Unified incident listing matching user role."""
    if user.role is UserRole.ADMIN:
        stmt = select(Incident)
    elif user.role is UserRole.OWNER:
        stmt = (
            select(Incident)
            .join(Resource, Incident.resource_id == Resource.id)
            .where((Resource.owner_id == user.id) | (Incident.reported_by == user.id))
        )
    else:
        stmt = select(Incident).where(Incident.reported_by == user.id)

    stmt = stmt.order_by(Incident.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    incidents = db.scalars(stmt).all()
    return {"success": True, "data": [_serialize(i, db) for i in incidents]}


@router.post("", status_code=201)
def report_incident(
    payload: IncidentIn,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    resource = db.get(Resource, payload.resource_id)
    if not resource:
        raise HTTPException(404, "Resource not found.")

    booking = None
    if payload.booking_id:
        booking = db.get(Booking, payload.booking_id)
        if not booking or booking.resource_id != resource.id:
            raise HTTPException(404, "Booking not found or does not belong to this resource.")
        if user.id != booking.user_id and user.role not in (UserRole.ADMIN, UserRole.OWNER):
            raise HTTPException(403, "You are not authorized to report an incident for this booking.")

    incident = Incident(
        resource_id=resource.id,
        booking_id=payload.booking_id,
        reported_by=user.id,
        incident_type=payload.parsed_type(),
        title=payload.title,
        description=payload.description,
        severity=payload.parsed_severity(),
        status=IncidentStatus.OPEN,
        evidence_urls=[],
    )
    db.add(incident)
    db.flush()

    if resource.owner_id != user.id:
        notify_incident_reported(db, resource.owner_id, incident.id, payload.title)

    db.commit()
    db.refresh(incident)
    log_audit_event(
        db=db,
        action_type="INCIDENT_CREATE",
        entity_type="incident",
        actor_id=user.id,
        entity_id=incident.id,
        description=f"Incident '{payload.title}' reported by {user.email}",
        metadata={"severity": payload.severity, "type": payload.incident_type},
    )
    return {"success": True, "data": _serialize(incident, db)}


@router.get("/me")
def my_incidents(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    q = select(Incident).where(Incident.reported_by == user.id).offset((page - 1) * page_size).limit(page_size)
    incidents = db.scalars(q).all()
    return {"success": True, "data": [_serialize(i, db) for i in incidents]}


@router.get("/owner/me")
def owner_incidents(
    user: User = Depends(require_roles(UserRole.OWNER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    q = (
        select(Incident)
        .join(Resource, Incident.resource_id == Resource.id)
        .where(Resource.owner_id == user.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    incidents = db.scalars(q).all()
    return {"success": True, "data": [_serialize(i, db) for i in incidents]}


@router.get("/admin/all")
def admin_all_incidents(
    user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: IncidentStatus | None = Query(None, alias="status"),
    severity_filter: IncidentSeverity | None = Query(None, alias="severity"),
) -> dict:
    q = select(Incident)
    if status_filter:
        q = q.where(Incident.status == status_filter)
    if severity_filter:
        q = q.where(Incident.severity == severity_filter)
    q = q.order_by(Incident.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    incidents = db.scalars(q).all()
    return {"success": True, "data": [_serialize(i, db) for i in incidents]}


@router.get("/{incident_id}")
def get_incident(
    incident_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found.")

    resource = db.get(Resource, incident.resource_id)
    is_authorized = (
        user.role is UserRole.ADMIN
        or user.id == incident.reported_by
        or (resource and resource.owner_id == user.id)
    )
    if not is_authorized:
        raise HTTPException(403, "Not authorized to view this incident.")
    return {"success": True, "data": _serialize(incident, db)}


@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: uuid.UUID,
    payload: IncidentStatusUpdate,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> dict:
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found.")

    target_status = payload.parsed_status()
    resource = db.get(Resource, incident.resource_id)
    if user.role is UserRole.OWNER:
        if not resource or resource.owner_id != user.id:
            raise HTTPException(403, "Not authorized.")
        if target_status in (IncidentStatus.RESOLVED, IncidentStatus.DISMISSED):
            raise HTTPException(403, "Owners cannot resolve or dismiss incidents. This requires admin review.")

    if target_status == IncidentStatus.RESOLVED and incident.reported_by == user.id and user.role is not UserRole.ADMIN:
        raise HTTPException(403, "Reporters cannot resolve their own incidents.")

    incident.status = target_status
    if payload.notes:
        incident.resolution_notes = (incident.resolution_notes or "") + f"\n[{target_status.value}] {payload.notes}"

    if incident.reported_by != user.id:
        notify_incident_updated(db, incident.reported_by, incident.id, target_status.value)

    db.commit()
    db.refresh(incident)
    log_audit_event(
        db=db,
        action_type="INCIDENT_STATUS_UPDATE",
        entity_type="incident",
        actor_id=user.id,
        entity_id=incident.id,
        description=f"Incident '{incident.title}' status updated to {target_status.value} by {user.email}",
        metadata={"status": target_status.value, "notes": payload.notes},
    )
    return {"success": True, "data": _serialize(incident, db)}


@router.post("/{incident_id}/evidence", status_code=201)
async def upload_evidence(
    incident_id: uuid.UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found.")

    resource = db.get(Resource, incident.resource_id)
    is_authorized = (
        user.role is UserRole.ADMIN
        or user.id == incident.reported_by
        or (resource and resource.owner_id == user.id)
    )
    if not is_authorized:
        raise HTTPException(403, "Not authorized to add evidence.")

    if incident.status in (IncidentStatus.RESOLVED, IncidentStatus.DISMISSED):
        raise HTTPException(409, "Cannot add evidence to a resolved or dismissed incident.")

    result = await upload_image(file, folder="incidents")
    incident.evidence_urls = list(incident.evidence_urls) + [result]
    db.commit()
    return {"success": True, "data": result}


@router.post("/{incident_id}/resolve")
def resolve_incident(
    incident_id: uuid.UUID,
    payload: IncidentResolve,
    user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found.")
    if incident.status == IncidentStatus.RESOLVED:
        raise HTTPException(409, "Incident is already resolved.")

    incident.status = IncidentStatus.RESOLVED
    incident.resolution_notes = payload.resolution_notes
    incident.resolved_at = datetime.now(timezone.utc)
    incident.assigned_admin_id = user.id

    if incident.reported_by != user.id:
        notify_incident_updated(db, incident.reported_by, incident.id, "RESOLVED")

    db.commit()
    db.refresh(incident)
    log_audit_event(
        db=db,
        action_type="INCIDENT_RESOLVE",
        entity_type="incident",
        actor_id=user.id,
        entity_id=incident.id,
        description=f"Incident '{incident.title}' resolved by admin {user.email}",
        metadata={"resolution_notes": payload.resolution_notes},
    )
    return {"success": True, "data": _serialize(incident, db)}
