import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import AccountStatus, UserRole


class UserBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    phone_number: str | None = Field(default=None, max_length=32)
    profile_image_url: str | None = Field(default=None, max_length=2048)
    institution_id: uuid.UUID | None = None


class UserCreate(UserBase):
    """Reserved for Phase 2 registration; never returned by an API response."""
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    account_status: AccountStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime
