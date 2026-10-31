import enum
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class VerificationType(str, enum.Enum): STUDENT_ID="STUDENT_ID"; STAFF_ID="STAFF_ID"; SAFETY_TRAINING="SAFETY_TRAINING"; EQUIPMENT_CERTIFICATION="EQUIPMENT_CERTIFICATION"; LAB_ACCESS="LAB_ACCESS"; OTHER="OTHER"
class VerificationState(str, enum.Enum): PENDING="PENDING"; APPROVED="APPROVED"; REJECTED="REJECTED"; EXPIRED="EXPIRED"
class UserVerification(TimestampMixin, Base):
    __tablename__="user_verifications"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    verification_type: Mapped[VerificationType]=mapped_column(Enum(VerificationType, name="verification_type"), index=True)
    title: Mapped[str]=mapped_column(String(255)); description: Mapped[str|None]=mapped_column(Text); document_url: Mapped[str|None]=mapped_column(String(2048))
    status: Mapped[VerificationState]=mapped_column(Enum(VerificationState, name="verification_state"), default=VerificationState.PENDING, index=True)
    reviewed_by: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")); reviewer_notes: Mapped[str|None]=mapped_column(Text)
    submitted_at: Mapped[datetime]=mapped_column(DateTime(timezone=True)); reviewed_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True)); expires_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True), index=True)
    user: Mapped["User"]=relationship(foreign_keys=[user_id]); reviewer: Mapped["User|None"]=relationship(foreign_keys=[reviewed_by])

class InstitutionVerificationHistory(TimestampMixin, Base):
    __tablename__="institution_verification_history"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), index=True)
    decided_by: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")); decision: Mapped[str]=mapped_column(String(16)); notes: Mapped[str|None]=mapped_column(Text); decided_at: Mapped[datetime]=mapped_column(DateTime(timezone=True))
    institution: Mapped["Institution"]=relationship(back_populates="verification_history")
