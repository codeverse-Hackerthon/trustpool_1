import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.core.config import get_settings
from app.core.database import get_db
from app.models.auth_token import EmailVerificationToken, PasswordResetToken, RefreshToken
from app.models.user import AccountStatus, User, UserRole
from app.schemas.auth import (ApiMessage, ChangePasswordRequest, EmailVerificationConfirm, EmailVerificationRequest, ForgotPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, TokenResponse, UserLoginRequest, UserRegistrationRequest, UserResponse)
from app.services.audit_service import log_audit_event
from app.services.email import queue_security_email
from app.services.security import (create_access_token, create_refresh_token, decode_token, generate_opaque_token, hash_password, safe_token_matches, token_hash, utcnow, verify_password)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
INVALID_CREDENTIALS = "Invalid email or password."


def _message(text: str) -> dict[str, object]:
    return {"success": True, "message": text}


def _issue_session(db: Session, user: User) -> TokenResponse:
    access_token, _, _ = create_access_token(user.id)
    refresh_token, jti, expires_at = create_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, token_jti=jti, token_hash=token_hash(refresh_token), expires_at=expires_at))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=get_settings().access_token_expire_minutes * 60, user=UserResponse.model_validate(user))


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=ApiMessage)
def register(payload: UserRegistrationRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    existing_user = db.scalar(select(User).where(User.email == str(payload.email)))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(full_name=payload.full_name.strip(), email=str(payload.email), hashed_password=hash_password(payload.password), phone_number=payload.phone_number, institution_id=payload.institution_id, role=UserRole.STUDENT, account_status=AccountStatus.ACTIVE, email_verified=False)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        log_audit_event(
            db=db,
            action_type="USER_REGISTER",
            entity_type="user",
            actor_id=user.id,
            entity_id=user.id,
            description=f"User {user.email} registered",
            metadata={"email": user.email, "role": user.role.value},
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    return _message("Registration successful. Verify your email to complete account setup.")


@router.post("/login", response_model=None)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user is None or not verify_password(payload.password, user.hashed_password):
        log_audit_event(
            db=db,
            action_type="LOGIN_FAILED",
            entity_type="user",
            description=f"Failed login attempt for {payload.email}",
            outcome="FAILURE",
            metadata={"email": str(payload.email)},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDENTIALS, headers={"WWW-Authenticate": "Bearer"})
    if user.account_status is not AccountStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is not active.")
    user.last_login_at = utcnow()
    response = _issue_session(db, user)
    db.commit()
    log_audit_event(
        db=db,
        action_type="LOGIN_SUCCESS",
        entity_type="user",
        actor_id=user.id,
        entity_id=user.id,
        description=f"User {user.email} logged in successfully",
        outcome="SUCCESS",
        metadata={"email": user.email, "role": user.role.value},
    )
    return {"success": True, "message": "Login successful", "data": response.model_dump(mode="json")}


@router.post("/refresh", response_model=None)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    claims = decode_token(payload.refresh_token, expected_type="refresh")
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_jti == claims["jti"]).with_for_update())
    if record is None or record.revoked_at is not None or record.expires_at <= utcnow() or not safe_token_matches(payload.refresh_token, record.token_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or expired.")
    user = db.get(User, record.user_id)
    if user is None or user.account_status is not AccountStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or expired.")
    response = _issue_session(db, user)
    new_jti = decode_token(response.refresh_token, expected_type="refresh")["jti"]
    record.revoked_at = utcnow()
    record.replaced_by_jti = new_jti
    db.commit()
    return {"success": True, "message": "Session refreshed", "data": response.model_dump(mode="json")}


@router.post("/logout", response_model=ApiMessage)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    claims = decode_token(payload.refresh_token, expected_type="refresh")
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_jti == claims["jti"]))
    if record and record.revoked_at is None and safe_token_matches(payload.refresh_token, record.token_hash):
        record.revoked_at = utcnow()
        db.commit()
    return _message("Signed out. Existing access tokens remain valid until their short expiry.")


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_active_user)) -> User:
    return user


@router.post("/verify-email/request", response_model=ApiMessage)
def request_email_verification(payload: EmailVerificationRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user and not user.email_verified and user.account_status is AccountStatus.ACTIVE:
        raw_token = generate_opaque_token()
        db.add(EmailVerificationToken(user_id=user.id, token_hash=token_hash(raw_token), expires_at=utcnow() + timedelta(minutes=get_settings().email_verification_expire_minutes)))
        db.commit()
        queue_security_email(user.email, "email verification", raw_token)
    return _message("If the account is eligible, a verification email will be sent.")


@router.post("/verify-email/confirm", response_model=ApiMessage)
def confirm_email_verification(payload: EmailVerificationConfirm, db: Session = Depends(get_db)) -> dict[str, object]:
    record = db.scalar(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash(payload.token)).with_for_update())
    if record is None or record.used_at is not None or record.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token is invalid or expired.")
    record.user.email_verified = True
    record.used_at = utcnow()
    db.commit()
    return _message("Email verified successfully.")


@router.post("/forgot-password", response_model=ApiMessage)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user and user.account_status is AccountStatus.ACTIVE:
        raw_token = generate_opaque_token()
        db.add(PasswordResetToken(user_id=user.id, token_hash=token_hash(raw_token), expires_at=utcnow() + timedelta(minutes=get_settings().password_reset_expire_minutes)))
        db.commit()
        queue_security_email(user.email, "password reset", raw_token)
    return _message("If an account exists for this email, password reset instructions will be sent.")


@router.post("/reset-password", response_model=ApiMessage)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict[str, object]:
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash(payload.token)).with_for_update())
    if record is None or record.used_at is not None or record.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token is invalid or expired.")
    user = record.user
    user.hashed_password = hash_password(payload.new_password)
    user.password_changed_at = utcnow()
    record.used_at = utcnow()
    db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=utcnow()))
    db.commit()
    log_audit_event(
        db=db,
        action_type="PASSWORD_RESET",
        entity_type="user",
        actor_id=user.id,
        entity_id=user.id,
        description=f"Password reset successfully for {user.email}",
        outcome="SUCCESS",
        metadata={"email": user.email},
    )
    return _message("Password reset successful. Please sign in again.")


@router.patch("/change-password", response_model=ApiMessage)
def change_password(payload: ChangePasswordRequest, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)) -> dict[str, object]:
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    user.hashed_password = hash_password(payload.new_password)
    user.password_changed_at = utcnow()
    db.execute(update(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)).values(revoked_at=utcnow()))
    db.commit()
    log_audit_event(
        db=db,
        action_type="PASSWORD_CHANGE",
        entity_type="user",
        actor_id=user.id,
        entity_id=user.id,
        description=f"Password changed successfully for {user.email}",
        outcome="SUCCESS",
        metadata={"email": user.email},
    )
    return _message("Password changed successfully. Please sign in again on other devices.")
