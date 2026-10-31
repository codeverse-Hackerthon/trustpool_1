"""Phase 10 — Notifications API.

Endpoints:
  GET    /notifications              — paginated list with read/type filters
  GET    /notifications/unread-count — count
  PATCH  /notifications/{id}/read    — mark single as read
  PATCH  /notifications/read-all     — mark all as read
  DELETE /notifications/{id}         — delete
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.notification import Notification, NotificationType
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _serialize(n: Notification) -> dict:
    return {
        "id": str(n.id),
        "title": n.title,
        "message": n.message,
        "notification_type": n.notification_type,
        "related_entity_type": n.related_entity_type,
        "related_entity_id": str(n.related_entity_id) if n.related_entity_id else None,
        "read": n.read_at is not None,
        "read_at": n.read_at.isoformat() if n.read_at else None,
        "created_at": n.created_at.isoformat(),
    }


@router.get("")
def list_notifications(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    unread_only: bool = Query(False),
    notification_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    q = select(Notification).where(Notification.recipient_id == user.id)
    if unread_only:
        q = q.where(Notification.read_at.is_(None))
    if notification_type:
        q = q.where(Notification.notification_type == notification_type)
    total = db.scalar(select(func.count()).select_from(q.subquery())) or 0
    items = db.scalars(
        q.order_by(Notification.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return {
        "success": True,
        "data": {
            "items": [_serialize(n) for n in items],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total,
            },
        },
    }


@router.get("/unread-count")
def unread_count(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    count = db.scalar(
        select(func.count()).where(
            Notification.recipient_id == user.id,
            Notification.read_at.is_(None),
        )
    ) or 0
    return {"success": True, "data": {"unread_count": count}}


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    notif = db.get(Notification, notification_id)
    if not notif or notif.recipient_id != user.id:
        raise HTTPException(404, "Notification not found.")
    if notif.read_at is None:
        notif.read_at = datetime.now(timezone.utc)
        db.commit()
    return {"success": True, "data": _serialize(notif)}


@router.patch("/read-all")
def mark_all_read(
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    now = datetime.now(timezone.utc)
    db.execute(
        update(Notification)
        .where(Notification.recipient_id == user.id, Notification.read_at.is_(None))
        .values(read_at=now)
    )
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    notif = db.get(Notification, notification_id)
    if not notif or notif.recipient_id != user.id:
        raise HTTPException(404, "Notification not found.")
    db.delete(notif)
    db.commit()
