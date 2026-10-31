"""Phase 10 — Notification model."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class NotificationType(str, enum.Enum):
    BOOKING_REQUEST = "BOOKING_REQUEST"
    BOOKING_APPROVED = "BOOKING_APPROVED"
    BOOKING_REJECTED = "BOOKING_REJECTED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    BOOKING_REMINDER = "BOOKING_REMINDER"
    BOOKING_OVERDUE = "BOOKING_OVERDUE"
    WAITLIST_PROMOTED = "WAITLIST_PROMOTED"
    INCIDENT_REPORTED = "INCIDENT_REPORTED"
    INCIDENT_UPDATED = "INCIDENT_UPDATED"
    RETURN_CONFIRMATION = "RETURN_CONFIRMATION"
    VERIFICATION_UPDATED = "VERIFICATION_UPDATED"
    SYSTEM_ALERT = "SYSTEM_ALERT"


class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    related_entity_type: Mapped[str | None] = mapped_column(String(64))
    related_entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
