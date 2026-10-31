"""Email notification service — wraps the core email module for notification events.

If no email provider is configured, in-app notifications remain the delivery channel
and this module logs the intent without claiming delivery.
"""
from __future__ import annotations

import logging

from app.services.email import queue_security_email

logger = logging.getLogger(__name__)


def send_booking_approved_email(recipient: str, resource_name: str) -> bool:
    """Notify a user that their booking was approved."""
    logger.info("Booking approval email requested for %s resource=%s", recipient, resource_name)
    # queue_security_email is designed for security tokens; a full email provider
    # integration would call a templated email API here.
    return _send_notification_email(recipient, "booking_approved", resource_name)


def send_booking_rejected_email(recipient: str, resource_name: str, reason: str) -> bool:
    logger.info("Booking rejection email requested for %s resource=%s", recipient, resource_name)
    return _send_notification_email(recipient, "booking_rejected", reason)


def send_incident_updated_email(recipient: str, incident_title: str, new_status: str) -> bool:
    logger.info("Incident update email requested for %s incident=%s status=%s", recipient, incident_title, new_status)
    return _send_notification_email(recipient, "incident_updated", new_status)


def send_verification_decision_email(recipient: str, decision: str) -> bool:
    logger.info("Verification decision email requested for %s decision=%s", recipient, decision)
    return _send_notification_email(recipient, "verification_decision", decision)


def _send_notification_email(recipient: str, kind: str, context: str) -> bool:
    """Unified path — relies on the core email module's provider abstraction."""
    from app.core.config import get_settings
    settings = get_settings()
    if not settings.email_provider:
        logger.info(
            "Notification email '%s' for %s not sent — no email provider configured.",
            kind, recipient,
        )
        return False
    # Forward to core module; real provider integration lives there.
    return queue_security_email(recipient, kind, context)
