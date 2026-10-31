import re
import uuid
from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models.user import AccountStatus, UserRole


def normalize_email(value: str) -> str:
    return value.strip().lower()


def validate_password_strength(value: str) -> str:
    if len(value) < 12 or not re.search(r"[a-z]", value) or not re.search(r"[A-Z]", value) or not re.search(r"\d", value):
        raise ValueError("Password must be at least 12 characters and include upper-case, lower-case, and numeric characters.")
    return value


class UserRegistrationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    full_name: str = Field(min_length=1, max_length=255, validation_alias=AliasChoices("full_name", "name"))
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    phone_number: str | None = Field(default=None, max_length=32, validation_alias=AliasChoices("phone_number", "phone"))
    institution_id: uuid.UUID | None = Field(default=None, validation_alias=AliasChoices("institution_id", "institutionId"))

    _normalize_email = field_validator("email")(normalize_email)
    _validate_password = field_validator("password")(validate_password_strength)


class UserLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    _normalize_email = field_validator("email")(normalize_email)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    full_name: str
    email: EmailStr
    role: UserRole
    phone_number: str | None
    institution_id: uuid.UUID | None
    account_status: AccountStatus
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    name: str | None = None
    role_name: str | None = None

    @model_validator(mode="after")
    def sync_user_fields(self) -> "UserResponse":
        self.name = self.full_name
        self.role_name = self.role.value.lower() if isinstance(self.role, UserRole) else str(self.role).lower()
        return self


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    token: str | None = None

    @model_validator(mode="after")
    def sync_token(self) -> "TokenResponse":
        self.token = self.access_token
        return self


class RefreshTokenRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    refresh_token: str = Field(min_length=1)


class EmailVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    _normalize_email = field_validator("email")(normalize_email)


class EmailVerificationConfirm(BaseModel):
    model_config = ConfigDict(extra="forbid")
    token: str = Field(min_length=20, max_length=512)


class ForgotPasswordRequest(EmailVerificationRequest):
    pass


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    token: str = Field(min_length=20, max_length=512)
    new_password: str = Field(min_length=12, max_length=128)
    _validate_password = field_validator("new_password")(validate_password_strength)


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=12, max_length=128)
    _validate_password = field_validator("new_password")(validate_password_strength)


class ApiMessage(BaseModel):
    success: bool = True
    message: str
