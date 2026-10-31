import enum
import uuid

from sqlalchemy import Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class InstitutionType(str, enum.Enum):
    COLLEGE = "COLLEGE"
    UNIVERSITY = "UNIVERSITY"
    LABORATORY = "LABORATORY"
    ORGANIZATION = "ORGANIZATION"
    OTHER = "OTHER"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class Institution(TimestampMixin, Base):
    __tablename__ = "institutions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    institution_type: Mapped[InstitutionType] = mapped_column(Enum(InstitutionType, name="institution_type"), nullable=False)
    email_domain: Mapped[str | None] = mapped_column(String(255), index=True)
    address: Mapped[str | None] = mapped_column(Text)
    contact_email: Mapped[str | None] = mapped_column(String(320))
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus, name="verification_status"), nullable=False, default=VerificationStatus.PENDING, index=True)

    users: Mapped[list["User"]] = relationship(back_populates="institution")
    resources: Mapped[list["Resource"]] = relationship(back_populates="institution")
    verification_history: Mapped[list["InstitutionVerificationHistory"]] = relationship(back_populates="institution", cascade="all, delete-orphan")
