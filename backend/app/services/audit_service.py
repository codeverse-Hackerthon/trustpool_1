"""Phase 13 — Reusable Audit Logging Service.

Provides automatic append-only audit tracking for institutional operations.
Ensures no sensitive credentials, secrets, or tokens are persisted.
"""
from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "hashed_password",
    "new_password",
    "access_token",
    "refresh_token",
    "secret",
    "token",
    "api_key",
    "credentials",
    "credit_card",
}


def sanitize_metadata(data: dict[str, Any] | None) -> dict[str, Any]:
    """Recursively scrub sensitive keys from metadata dict."""
    if not data:
        return {}
    sanitized: dict[str, Any] = {}
    for key, value in data.items():
        if any(sens in key.lower() for sens in SENSITIVE_KEYS):
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_metadata(value)
        elif isinstance(value, uuid.UUID):
            sanitized[key] = str(value)
        else:
            sanitized[key] = value
    return sanitized


def log_audit_event(
    db: Session,
    action_type: str,
    entity_type: str,
    actor_id: uuid.UUID | None = None,
    entity_id: uuid.UUID | None = None,
    description: str = "",
    outcome: str = "SUCCESS",
    metadata: dict[str, Any] | None = None,
    correlation_id: str | None = None,
    commit: bool = True,
) -> AuditLog:
    """Create an append-only audit log entry."""
    safe_metadata = sanitize_metadata(metadata)
    log_entry = AuditLog(
        id=uuid.uuid4(),
        actor_id=actor_id,
        action_type=action_type.upper(),
        entity_type=entity_type.lower(),
        entity_id=entity_id,
        description=description,
        outcome=outcome.upper(),
        correlation_id=correlation_id,
        metadata_json=safe_metadata,
    )
    db.add(log_entry)
    if commit:
        try:
            db.commit()
            db.refresh(log_entry)
        except Exception as e:
            db.rollback()
            logger.error("Failed to persist audit log: %s", e)
            raise
    return log_entry

