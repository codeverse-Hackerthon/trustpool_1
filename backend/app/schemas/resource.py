import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.resource import ResourceStatus, ResourceType


class ResourceBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    category: str = Field(min_length=1, max_length=100)
    resource_type: ResourceType
    institution_id: uuid.UUID | None = None
    location: str | None = Field(default=None, max_length=255)
    capacity: int | None = Field(default=None, gt=0)
    usage_instructions: str | None = None


class ResourceCreate(ResourceBase):
    owner_id: uuid.UUID


class ResourceRead(ResourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    owner_id: uuid.UUID
    status: ResourceStatus
    created_at: datetime
    updated_at: datetime
