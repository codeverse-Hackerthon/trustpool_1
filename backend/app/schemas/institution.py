import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.institution import InstitutionType, VerificationStatus


class InstitutionBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    institution_type: InstitutionType
    email_domain: str | None = Field(default=None, max_length=255)
    address: str | None = None
    contact_email: EmailStr | None = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionRead(InstitutionBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime
