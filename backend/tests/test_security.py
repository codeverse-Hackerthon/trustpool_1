import uuid
from datetime import timedelta

import pytest
from fastapi import HTTPException

from app.schemas.auth import UserRegistrationRequest
from app.services.security import (create_access_token, create_refresh_token, decode_token, hash_password, safe_token_matches, token_hash, utcnow, verify_password)


def test_password_is_argon2_hash_and_never_matches_plaintext() -> None:
    password = "CorrectHorseBattery9"
    encoded = hash_password(password)
    assert encoded != password
    assert encoded.startswith("$argon2id$")
    assert verify_password(password, encoded)
    assert not verify_password("not-the-password", encoded)


def test_access_and_refresh_tokens_are_type_separated() -> None:
    user_id = uuid.uuid4()
    access, _, _ = create_access_token(user_id)
    refresh, _, _ = create_refresh_token(user_id)
    assert decode_token(access, "access")["sub"] == str(user_id)
    assert decode_token(refresh, "refresh")["type"] == "refresh"
    with pytest.raises(HTTPException):
        decode_token(refresh, "access")


def test_malformed_token_is_rejected() -> None:
    with pytest.raises(HTTPException):
        decode_token("definitely.not.a.jwt", "access")


def test_token_hash_comparison_requires_the_original_token() -> None:
    raw = "sensitive-refresh-token"
    assert safe_token_matches(raw, token_hash(raw))
    assert not safe_token_matches("other-token", token_hash(raw))


def test_public_registration_rejects_role_assignment() -> None:
    with pytest.raises(Exception):
        UserRegistrationRequest.model_validate({"full_name": "A Student", "email": "student@example.edu", "password": "CorrectHorseBattery9", "role": "ADMIN"})


def test_weak_password_is_rejected() -> None:
    with pytest.raises(Exception):
        UserRegistrationRequest(full_name="A Student", email="student@example.edu", password="weak-password")
