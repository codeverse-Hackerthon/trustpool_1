"""Phase 11 — AI analysis result storage model."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class AIAnalysis(TimestampMixin, Base):
    """Stores AI-generated analysis results. Advisory only — never drives automated decisions."""
    __tablename__ = "ai_analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # What entity this analysis is about
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)
    # Who requested it
    requested_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    # Analysis kind: INCIDENT_SUMMARY | DAMAGE_DETECTION | USAGE_ANOMALY | VERIFICATION_ASSIST | RECOMMENDATION
    analysis_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    # Model used
    model: Mapped[str] = mapped_column(String(64), nullable=False)
    # The AI-produced result
    result: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    # Human review override
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewer_notes: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Was this accepted by a human reviewer?
    human_accepted: Mapped[bool | None] = mapped_column()
