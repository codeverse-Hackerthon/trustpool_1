import enum
import uuid

from sqlalchemy import Boolean, CheckConstraint, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class ResourceType(str, enum.Enum):
    SPACE = "SPACE"
    EQUIPMENT = "EQUIPMENT"


class ResourceStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"


class Resource(TimestampMixin, Base):
    __tablename__ = "resources"
    __table_args__ = (CheckConstraint("capacity IS NULL OR capacity > 0", name="ck_resources_capacity_positive"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[ResourceType] = mapped_column(Enum(ResourceType, name="resource_type"), nullable=False, index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    institution_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="SET NULL"), index=True)
    location: Mapped[str | None] = mapped_column(String(255))
    capacity: Mapped[int | None] = mapped_column(Integer)
    usage_instructions: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ResourceStatus] = mapped_column(Enum(ResourceStatus, name="resource_status"), nullable=False, default=ResourceStatus.ACTIVE, index=True)
    specifications: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    deposit_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    min_booking_minutes: Mapped[int | None] = mapped_column(Integer)
    max_booking_minutes: Mapped[int | None] = mapped_column(Integer)
    advance_booking_days: Mapped[int | None] = mapped_column(Integer)
    requires_approval: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    requires_training: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    required_verification_types: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    institution_only: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    owner: Mapped["User"] = relationship(back_populates="owned_resources", foreign_keys=[owner_id])
    institution: Mapped["Institution | None"] = relationship(back_populates="resources")
    images: Mapped[list["ResourceImage"]] = relationship(back_populates="resource", cascade="all, delete-orphan", order_by="ResourceImage.position")
    availability_windows: Mapped[list["ResourceAvailability"]] = relationship(back_populates="resource", cascade="all, delete-orphan")
    closures: Mapped[list["ResourceClosure"]] = relationship(back_populates="resource", cascade="all, delete-orphan")
