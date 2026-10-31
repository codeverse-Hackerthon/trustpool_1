import uuid
from datetime import date, time
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
class ResourceImage(TimestampMixin, Base):
    __tablename__="resource_images"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4); resource_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), index=True); url: Mapped[str]=mapped_column(String(2048)); alt_text: Mapped[str|None]=mapped_column(String(255)); position: Mapped[int]=mapped_column(Integer, default=0); is_cover: Mapped[bool]=mapped_column(Boolean, default=False)
    resource: Mapped["Resource"]=relationship(back_populates="images")
class ResourceAvailability(TimestampMixin, Base):
    __tablename__="resource_availability"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4); resource_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), index=True); weekday: Mapped[int]=mapped_column(Integer); opens_at: Mapped[time]=mapped_column(Time); closes_at: Mapped[time]=mapped_column(Time); timezone: Mapped[str]=mapped_column(String(64), default="UTC")
    resource: Mapped["Resource"]=relationship(back_populates="availability_windows")
class ResourceClosure(TimestampMixin, Base):
    __tablename__="resource_closures"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4); resource_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), index=True); starts_on: Mapped[date]=mapped_column(Date); ends_on: Mapped[date]=mapped_column(Date); reason: Mapped[str|None]=mapped_column(String(255)); is_maintenance: Mapped[bool]=mapped_column(Boolean, default=False)
    resource: Mapped["Resource"]=relationship(back_populates="closures")
