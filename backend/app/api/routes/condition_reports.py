"""Phase 9 — Condition Reports API.

Endpoints:
  POST   /condition-reports
  GET    /condition-reports
  GET    /condition-reports/{report_id}
  GET    /bookings/{booking_id}/condition-reports
  GET    /condition-reports/booking/{booking_id}
  PATCH  /condition-reports/{report_id}
"""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import AliasChoices, BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, require_roles
from app.core.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.incident import ConditionReport, ReportType
from app.models.resource import Resource
from app.models.user import User, UserRole
from app.services.audit_service import log_audit_event
from app.services.storage import upload_image

router = APIRouter(tags=["Condition Reports"])

VALID_CONDITIONS = {"EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"}


class ConditionReportIn(BaseModel):
    booking_id: uuid.UUID = Field(validation_alias=AliasChoices("booking_id", "bookingId"))
    report_type: str = Field(validation_alias=AliasChoices("report_type", "type"))
    overall_condition: str = Field(min_length=1, max_length=64, validation_alias=AliasChoices("overall_condition", "overallRating"))
    description: str | None = Field(None, max_length=5000, validation_alias=AliasChoices("description", "comments"))
    damage_detected: bool = Field(False, validation_alias=AliasChoices("damage_detected", "hasDamage"))

    def parsed_report_type(self) -> ReportType:
        rt = self.report_type.upper()
        if rt in ("PRE_USE", "BEFORE_USE"):
            return ReportType.BEFORE_USE
        elif rt in ("POST_USE", "AFTER_USE"):
            return ReportType.AFTER_USE
        try:
            return ReportType(rt)
        except ValueError:
            raise HTTPException(422, f"Invalid report type: {self.report_type}")

    def validate_condition(self) -> str:
        cond = self.overall_condition.upper()
        if cond not in VALID_CONDITIONS:
            raise HTTPException(422, f"overall_condition must be one of: {', '.join(VALID_CONDITIONS)}")
        return cond


class ConditionReportUpdate(BaseModel):
    overall_condition: str | None = Field(None, max_length=64, validation_alias=AliasChoices("overall_condition", "overallRating"))
    description: str | None = Field(None, max_length=5000, validation_alias=AliasChoices("description", "comments"))
    damage_detected: bool | None = Field(None, validation_alias=AliasChoices("damage_detected", "hasDamage"))


def _serialize(r: ConditionReport, db: Session | None = None) -> dict:
    res = db.get(Resource, r.resource_id) if db and r.resource_id else None
    user = db.get(User, r.submitted_by) if db and r.submitted_by else None

    cond_lower = r.overall_condition.lower()
    type_str = "pre_use" if r.report_type == ReportType.BEFORE_USE else "post_use"

    return {
        "id": str(r.id),
        "booking_id": str(r.booking_id),
        "bookingId": str(r.booking_id),
        "resource_id": str(r.resource_id),
        "resourceId": str(r.resource_id),
        "resourceTitle": res.name if res else "Verified Resource",
        "submitted_by": str(r.submitted_by),
        "userId": str(r.submitted_by),
        "userName": user.full_name if user else "Borrower",
        "report_type": r.report_type.value,
        "type": type_str,
        "overall_condition": r.overall_condition,
        "overallRating": cond_lower,
        "description": r.description,
        "comments": r.description or "",
        "evidence_urls": r.evidence_urls or [],
        "photoUrls": r.evidence_urls or [],
        "damage_detected": r.damage_detected,
        "hasDamage": r.damage_detected,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _get_booking_and_resource(db: Session, booking_id: uuid.UUID) -> tuple[Booking, Resource]:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found.")
    resource = db.get(Resource, booking.resource_id)
    if not resource:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found.")
    return booking, resource


def _assert_participant(booking: Booking, resource: Resource, user: User) -> None:
    if user.role is UserRole.ADMIN:
        return
    if user.id not in (booking.user_id, resource.owner_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not authorized to submit a condition report for this booking.")


@router.get("/condition-reports")
def list_condition_reports(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    if user.role is UserRole.ADMIN:
        stmt = select(ConditionReport)
    elif user.role is UserRole.OWNER:
        stmt = select(ConditionReport).join(Resource, ConditionReport.resource_id == Resource.id).where(
            (Resource.owner_id == user.id) | (ConditionReport.submitted_by == user.id)
        )
    else:
        stmt = select(ConditionReport).where(ConditionReport.submitted_by == user.id)

    reports = db.scalars(stmt.order_by(ConditionReport.created_at.desc())).all()
    return {"success": True, "data": [_serialize(r, db) for r in reports]}


@router.post("/condition-reports", status_code=201)
def submit_condition_report(
    payload: ConditionReportIn,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    norm_condition = payload.validate_condition()
    rt = payload.parsed_report_type()
    booking, resource = _get_booking_and_resource(db, payload.booking_id)
    _assert_participant(booking, resource, user)

    # Validate booking status
    if booking.status not in (BookingStatus.APPROVED, BookingStatus.ACTIVE, BookingStatus.COMPLETED, BookingStatus.OVERDUE):
        raise HTTPException(422, "Condition reports can only be submitted for approved, active, or completed bookings.")

    # Prevent duplicate report type per booking per user
    existing = db.scalar(
        select(ConditionReport).where(
            ConditionReport.booking_id == payload.booking_id,
            ConditionReport.submitted_by == user.id,
            ConditionReport.report_type == rt,
        )
    )
    if existing:
        raise HTTPException(409, f"A {rt.value} report has already been submitted for this booking.")

    report = ConditionReport(
        booking_id=payload.booking_id,
        resource_id=resource.id,
        submitted_by=user.id,
        report_type=rt,
        overall_condition=norm_condition,
        description=payload.description,
        damage_detected=payload.damage_detected,
        evidence_urls=[],
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    log_audit_event(
        db=db,
        action_type="CONDITION_REPORT_SUBMIT",
        entity_type="condition_report",
        actor_id=user.id,
        entity_id=report.id,
        description=f"Condition report ({rt.value}) submitted by {user.email} for resource {resource.name}",
        metadata={"condition": norm_condition, "damage_detected": payload.damage_detected},
    )
    return {"success": True, "data": _serialize(report, db)}


@router.get("/condition-reports/{report_id}")
def get_condition_report(
    report_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    report = db.get(ConditionReport, report_id)
    if not report:
        raise HTTPException(404, "Condition report not found.")
    booking, resource = _get_booking_and_resource(db, report.booking_id)
    _assert_participant(booking, resource, user)
    return {"success": True, "data": _serialize(report, db)}


@router.get("/bookings/{booking_id}/condition-reports")
@router.get("/condition-reports/booking/{booking_id}")
def get_booking_condition_reports(
    booking_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    booking, resource = _get_booking_and_resource(db, booking_id)
    _assert_participant(booking, resource, user)
    reports = db.scalars(select(ConditionReport).where(ConditionReport.booking_id == booking_id)).all()
    return {"success": True, "data": [_serialize(r, db) for r in reports]}


@router.patch("/condition-reports/{report_id}")
def update_condition_report(
    report_id: uuid.UUID,
    payload: ConditionReportUpdate,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    report = db.get(ConditionReport, report_id)
    if not report:
        raise HTTPException(404, "Condition report not found.")
    if user.id != report.submitted_by and user.role is not UserRole.ADMIN:
        raise HTTPException(403, "You are not authorized to update this report.")

    if payload.overall_condition is not None:
        oc = payload.overall_condition.upper()
        if oc not in VALID_CONDITIONS:
            raise HTTPException(422, f"overall_condition must be one of: {', '.join(VALID_CONDITIONS)}")
        report.overall_condition = oc
    if payload.description is not None:
        report.description = payload.description
    if payload.damage_detected is not None:
        report.damage_detected = payload.damage_detected

    db.commit()
    db.refresh(report)
    return {"success": True, "data": _serialize(report, db)}


@router.post("/condition-reports/{report_id}/images", status_code=201)
async def upload_condition_report_image(
    report_id: uuid.UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    report = db.get(ConditionReport, report_id)
    if not report:
        raise HTTPException(404, "Condition report not found.")
    if user.id != report.submitted_by and user.role is not UserRole.ADMIN:
        raise HTTPException(403, "Not authorized.")
    result = await upload_image(file, folder="condition_reports")
    report.evidence_urls = list(report.evidence_urls) + [result]
    db.commit()
    return {"success": True, "data": result}
