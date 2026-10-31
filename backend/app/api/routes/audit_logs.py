"""Phase 13 — Audit Logs API endpoints.

Endpoints:
  GET /api/v1/audit-logs          — List audit events with filtering & pagination
  GET /api/v1/audit-logs/{log_id} — Retrieve detailed single audit record

Security:
  - Admins: Unrestricted view of institutional audit trail.
  - Owners: Restricted view of actions concerning their owned resources or requests.
  - Students: 403 Forbidden.
  - Append-only: No update or deletion operations exist.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, require_roles
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.models.resource import Resource
from app.models.user import User, UserRole

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


def _serialize_audit_log(log: AuditLog, actor_name: str | None = None) -> dict[str, Any]:
    return {
        "id": str(log.id),
        "actorId": str(log.actor_id) if log.actor_id else None,
        "actor_id": str(log.actor_id) if log.actor_id else None,
        "actorName": actor_name or ("System" if not log.actor_id else "Authorized User"),
        "actionType": log.action_type,
        "action_type": log.action_type,
        "entityType": log.entity_type,
        "entity_type": log.entity_type,
        "entityId": str(log.entity_id) if log.entity_id else None,
        "entity_id": str(log.entity_id) if log.entity_id else None,
        "description": log.description,
        "outcome": log.outcome,
        "correlationId": log.correlation_id,
        "metadata": log.metadata_json,
        "createdAt": log.created_at.isoformat() if log.created_at else None,
        "timestamp": log.created_at.isoformat() if log.created_at else None,
    }


@router.get("", summary="List audit log events")
def list_audit_logs(
    actor_id: uuid.UUID | None = Query(None),
    action_type: str | None = Query(None),
    entity_type: str | None = Query(None),
    entity_id: uuid.UUID | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    outcome: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve audit events based on role authorization."""
    query = select(AuditLog)

    # Owner scoping — owners only see activity on their resources or initiated by them
    if user.role == UserRole.OWNER:
        owned_resource_ids = db.scalars(
            select(Resource.id).where(Resource.owner_id == user.id)
        ).all()
        query = query.where(
            (AuditLog.actor_id == user.id)
            | (
                (AuditLog.entity_type == "resource")
                & (AuditLog.entity_id.in_(owned_resource_ids))
            )
        )

    if actor_id:
        query = query.where(AuditLog.actor_id == actor_id)
    if action_type:
        query = query.where(AuditLog.action_type == action_type.upper())
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type.lower())
    if entity_id:
        query = query.where(AuditLog.entity_id == entity_id)
    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
    if end_date:
        query = query.where(AuditLog.created_at <= end_date)
    if outcome:
        query = query.where(AuditLog.outcome == outcome.upper())

    total_count = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    logs = db.scalars(query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)).all()

    # Pre-fetch actor names for display convenience
    actor_ids = {l.actor_id for l in logs if l.actor_id}
    actors = {}
    if actor_ids:
        user_rows = db.execute(
            select(User.id, User.full_name).where(User.id.in_(actor_ids))
        ).all()
        actors = {u_id: name for u_id, name in user_rows}

    items = [_serialize_audit_log(l, actors.get(l.actor_id)) for l in logs]

    return {
        "success": True,
        "data": {
            "items": items,
            "total": total_count,
            "limit": limit,
            "offset": offset,
        },
        "items": items,
        "total": total_count,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{log_id}", summary="Get audit log details")
def get_audit_log(
    log_id: uuid.UUID,
    user: User = Depends(require_roles(UserRole.ADMIN, UserRole.OWNER)),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve detailed single audit log event."""
    log = db.get(AuditLog, log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log entry not found.")

    if user.role == UserRole.OWNER:
        if log.actor_id != user.id:
            owned_resource_ids = db.scalars(
                select(Resource.id).where(Resource.owner_id == user.id)
            ).all()
            if log.entity_type != "resource" or log.entity_id not in owned_resource_ids:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this audit log.")

    actor_name = None
    if log.actor_id:
        actor = db.get(User, log.actor_id)
        if actor:
            actor_name = actor.full_name

    serialized = _serialize_audit_log(log, actor_name)
    return {
        "success": True,
        "data": serialized,
        **serialized,
    }
