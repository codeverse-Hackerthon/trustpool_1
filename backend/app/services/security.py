import hashlib
import hmac
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import HTTPException, status

from app.core.config import get_settings

password_hasher = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_opaque_token() -> str:
    return secrets.token_urlsafe(48)


def _create_token(user_id: uuid.UUID, token_type: str, expires_delta: timedelta, jti: str | None = None) -> tuple[str, str, datetime]:
    settings = get_settings()
    issued_at = utcnow()
    expires_at = issued_at + expires_delta
    token_jti = jti or str(uuid.uuid4())
    payload = {"sub": str(user_id), "type": token_type, "jti": token_jti, "iat": issued_at, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret(), algorithm=settings.jwt_algorithm), token_jti, expires_at


def create_access_token(user_id: uuid.UUID) -> tuple[str, str, datetime]:
    settings = get_settings()
    return _create_token(user_id, "access", timedelta(minutes=settings.access_token_expire_minutes))


def create_refresh_token(user_id: uuid.UUID) -> tuple[str, str, datetime]:
    settings = get_settings()
    return _create_token(user_id, "refresh", timedelta(days=settings.refresh_token_expire_days))


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    settings = get_settings()
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.jwt_secret(), algorithms=[settings.jwt_algorithm], options={"require": ["sub", "type", "jti", "iat", "exp"]})
        uuid.UUID(str(payload["sub"]))
        if payload["type"] != expected_type:
            raise credentials_error
        return payload
    except (jwt.PyJWTError, ValueError):
        raise credentials_error


def safe_token_matches(raw_token: str, expected_hash: str) -> bool:
    return hmac.compare_digest(token_hash(raw_token), expected_hash)
