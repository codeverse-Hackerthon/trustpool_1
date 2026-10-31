from functools import lru_cache
import secrets
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven application settings. Values are never logged."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore", enable_decoding=False)

    app_name: str = "trustPool API"
    app_env: Literal["development", "test", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/trustpool"
    frontend_url: str = "http://localhost:5173"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    log_level: str = "INFO"
    jwt_secret_key: SecretStr | None = None
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=15, gt=0, le=1440)
    refresh_token_expire_days: int = Field(default=14, gt=0, le=90)
    email_verification_expire_minutes: int = Field(default=60, gt=0, le=10080)
    password_reset_expire_minutes: int = Field(default=30, gt=0, le=1440)
    email_provider: str | None = None
    dev_email_outbox_path: str | None = None
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: SecretStr | None = None
    cloudinary_api_secret: SecretStr | None = None
    openai_api_key: SecretStr | None = None
    ai_model: str = "gpt-4.1-mini"
    ai_enabled: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        if not value.startswith(("postgresql+psycopg://", "postgresql://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection URL")
        return value

    @model_validator(mode="after")
    def validate_security_configuration(self) -> "Settings":
        if self.app_env == "production" and not self.jwt_secret_key:
            raise ValueError("JWT_SECRET_KEY is required in production")
        return self

    def jwt_secret(self) -> str:
        """Use an ephemeral key only for unconfigured local development."""
        if self.jwt_secret_key:
            return self.jwt_secret_key.get_secret_value()
        if self.app_env == "production":
            raise RuntimeError("JWT_SECRET_KEY is required in production")
        return _development_jwt_secret


_development_jwt_secret = secrets.token_urlsafe(48)


@lru_cache
def get_settings() -> Settings:
    return Settings()
