"""Scheduled notification jobs.

These functions are designed to be called by an external scheduler
(e.g., APScheduler, Celery Beat, cron via a management script).

They are NOT in-memory timers and will survive server restarts.
Run them on a separate worker or via a cron endpoint that is
NOT exposed to the public internet.

Duplicate notification prevention:
  - Before creating a reminder, check for an existing notification
    with the same type, entity, and recipient created within the
    current scheduling window (idempotency window).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification, NotificationType
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)

_REMINDER_WINDOW_HOURS = 24   # remind this many hours before start
_IDEMPOTENCY_WINDOW_HOURS = 6  # don't re-send within this window


def _already_sent(
    db: Session,
    recipient_id: uuid.UUID,
    notification_type: str,
    related_entity_id: uuid.UUID,
    window_hours: int = _IDEMPOTENCY_WINDOW_HOURS,
) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    result = db.scalar(
        select(Notification).where(
            Notification.recipient_id == recipient_id,
            Notification.notification_type == notification_type,
            Notification.related_entity_id == related_entity_id,
            Notification.created_at >= cutoff,
        )
    )
    return result is not None


def send_upcoming_booking_reminders(db: Session) -> int:
    """Send reminders for bookings starting within the next REMINDER_WINDOW_HOURS hours."""
    now = datetime.now(timezone.utc)
    window_end = now + timedelta(hours=_REMINDER_WINDOW_HOURS)

    bookings = db.scalars(
        select(Booking).where(
            Booking.status == BookingStatus.APPROVED,
            Booking.start_at >= now,
            Booking.start_at <= window_end,
        )
    ).all()

    sent = 0
    for booking in bookings:
        if _already_sent(db, booking.user_id, NotificationType.BOOKING_REMINDER, booking.id):
            continue
        create_notification(
            db,
            recipient_id=booking.user_id,
            title="Upcoming Booking Reminder",
            message=f"Your booking starts at {booking.start_at.isoformat()}. Please arrive on time.",
            notification_type=NotificationType.BOOKING_REMINDER,
            related_entity_type="booking",
            related_entity_id=booking.id,
        )
        sent += 1

    if sent:
        db.commit()
    logger.info("Sent %d booking reminders", sent)
    return sent


def send_overdue_booking_alerts(db: Session) -> int:
    """Mark overdue bookings and send alerts."""
    now = datetime.now(timezone.utc)

    overdue_bookings = db.scalars(
        select(Booking).where(
            Booking.status == BookingStatus.ACTIVE,
            Booking.end_at < now,
        )
    ).all()

    sent = 0
    for booking in overdue_bookings:
        booking.status = BookingStatus.OVERDUE
        if _already_sent(db, booking.user_id, NotificationType.BOOKING_OVERDUE, booking.id):
            continue
        create_notification(
            db,
            recipient_id=booking.user_id,
            title="Booking Overdue",
            message=f"Your booking ended at {booking.end_at.isoformat()} and has not been returned. Please return the resource immediately.",
            notification_type=NotificationType.BOOKING_OVERDUE,
            related_entity_type="booking",
            related_entity_id=booking.id,
        )
        sent += 1

    if sent or overdue_bookings:
        db.commit()
    logger.info("Processed %d overdue bookings, sent %d alerts", len(overdue_bookings), sent)
    return sent


def run_all_scheduled_jobs(db: Session) -> dict[str, int]:
    """Convenience: run all scheduled jobs and return counts."""
    return {
        "reminders_sent": send_upcoming_booking_reminders(db),
        "overdue_alerts_sent": send_overdue_booking_alerts(db),
    }
