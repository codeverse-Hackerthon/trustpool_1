"""Notification service — create and deliver in-app notifications.

This is the single authoritative place where notifications are created.
Route handlers and other services call functions here; they do NOT create
Notification rows directly.
"""
from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    recipient_id: uuid.UUID,
    title: str,
    message: str,
    notification_type: str,
    related_entity_type: str | None = None,
    related_entity_id: uuid.UUID | None = None,
) -> Notification:
    """Persist a notification and return it (caller must commit)."""
    notif = Notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
    )
    db.add(notif)
    logger.debug("Notification queued: type=%s recipient=%s", notification_type, recipient_id)
    return notif


# ── Typed helpers ──────────────────────────────────────────────────────────────

def notify_booking_request(db: Session, owner_id: uuid.UUID, booking_id: uuid.UUID, resource_name: str) -> Notification:
    return create_notification(
        db, owner_id,
        title="New Booking Request",
        message=f"A new booking request has been submitted for '{resource_name}'.",
        notification_type=NotificationType.BOOKING_REQUEST,
        related_entity_type="booking",
        related_entity_id=booking_id,
    )


def notify_booking_approved(db: Session, user_id: uuid.UUID, booking_id: uuid.UUID, resource_name: str) -> Notification:
    return create_notification(
        db, user_id,
        title="Booking Approved",
        message=f"Your booking for '{resource_name}' has been approved.",
        notification_type=NotificationType.BOOKING_APPROVED,
        related_entity_type="booking",
        related_entity_id=booking_id,
    )


def notify_booking_rejected(db: Session, user_id: uuid.UUID, booking_id: uuid.UUID, resource_name: str, reason: str | None = None) -> Notification:
    msg = f"Your booking for '{resource_name}' has been rejected."
    if reason:
        msg += f" Reason: {reason}"
    return create_notification(
        db, user_id,
        title="Booking Rejected",
        message=msg,
        notification_type=NotificationType.BOOKING_REJECTED,
        related_entity_type="booking",
        related_entity_id=booking_id,
    )


def notify_booking_cancelled(db: Session, recipient_id: uuid.UUID, booking_id: uuid.UUID, resource_name: str) -> Notification:
    return create_notification(
        db, recipient_id,
        title="Booking Cancelled",
        message=f"The booking for '{resource_name}' has been cancelled.",
        notification_type=NotificationType.BOOKING_CANCELLED,
        related_entity_type="booking",
        related_entity_id=booking_id,
    )


def notify_return_confirmed(db: Session, user_id: uuid.UUID, booking_id: uuid.UUID, resource_name: str) -> Notification:
    return create_notification(
        db, user_id,
        title="Return Confirmed",
        message=f"Your return of '{resource_name}' has been confirmed.",
        notification_type=NotificationType.RETURN_CONFIRMATION,
        related_entity_type="booking",
        related_entity_id=booking_id,
    )


def notify_waitlist_promoted(db: Session, user_id: uuid.UUID, resource_id: uuid.UUID, resource_name: str) -> Notification:
    return create_notification(
        db, user_id,
        title="Waitlist Position Available",
        message=f"A slot for '{resource_name}' is now available. Please book soon.",
        notification_type=NotificationType.WAITLIST_PROMOTED,
        related_entity_type="resource",
        related_entity_id=resource_id,
    )


def notify_incident_reported(db: Session, owner_id: uuid.UUID, incident_id: uuid.UUID, title: str) -> Notification:
    return create_notification(
        db, owner_id,
        title="Incident Reported",
        message=f"An incident has been reported: '{title}'. Please review.",
        notification_type=NotificationType.INCIDENT_REPORTED,
        related_entity_type="incident",
        related_entity_id=incident_id,
    )


def notify_incident_updated(db: Session, recipient_id: uuid.UUID, incident_id: uuid.UUID, new_status: str) -> Notification:
    return create_notification(
        db, recipient_id,
        title="Incident Status Updated",
        message=f"An incident you are involved in has been updated to: {new_status}.",
        notification_type=NotificationType.INCIDENT_UPDATED,
        related_entity_type="incident",
        related_entity_id=incident_id,
    )


def notify_verification_updated(db: Session, user_id: uuid.UUID, verification_id: uuid.UUID, new_status: str) -> Notification:
    return create_notification(
        db, user_id,
        title="Verification Updated",
        message=f"Your verification submission has been updated to: {new_status}.",
        notification_type=NotificationType.VERIFICATION_UPDATED,
        related_entity_type="verification",
        related_entity_id=verification_id,
    )
