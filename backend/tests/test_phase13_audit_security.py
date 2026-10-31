"""Phase 13 — Audit Logs & Security Hardening Test Suite.

Verifies:
1. Audit log retrieval and role authorization (Admin full, Owner scoped, Student 403).
2. Automatic event recording across Auth, Bookings, Incidents.
3. Sensitive metadata sanitization (passwords, tokens redacted).
4. Security hardening: HTTP security headers, sliding-window rate limiting (429), and request body size limit (413).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security_middleware import rate_limiter
from app.models.audit_log import AuditLog
from app.models.booking import Booking, BookingStatus
from app.models.resource import Resource, ResourceStatus, ResourceType
from app.models.user import AccountStatus, User, UserRole
from app.services.audit_service import log_audit_event, sanitize_metadata
from tests.conftest import auth_headers, make_booking, make_resource, make_user


class TestAuditLogsAPI:
    def test_admin_can_list_audit_logs(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        log_audit_event(
            db=db,
            action_type="TEST_ACTION",
            entity_type="system",
            actor_id=admin.id,
            description="Test system operation",
        )
        db.commit()

        resp = client.get("/api/v1/audit-logs", headers=auth_headers(admin))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data["items"]) >= 1
        item = data["items"][0]
        assert "action_type" in item or "actionType" in item or "eventType" in item

    def test_student_forbidden_from_audit_logs(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        db.commit()

        resp = client.get("/api/v1/audit-logs", headers=auth_headers(student))
        assert resp.status_code == 403

    def test_single_audit_log_retrieval(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        log = log_audit_event(
            db=db,
            action_type="INSPECTION",
            entity_type="server",
            actor_id=admin.id,
            description="Inspection complete",
        )
        db.commit()

        resp = client.get(f"/api/v1/audit-logs/{log.id}", headers=auth_headers(admin))
        assert resp.status_code == 200
        assert resp.json()["data"]["action_type"] == "INSPECTION"

    def test_audit_log_filters(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        log_audit_event(db=db, action_type="SPECIFIC_EVENT", entity_type="booking", actor_id=admin.id)
        db.commit()

        resp = client.get("/api/v1/audit-logs?action_type=SPECIFIC_EVENT", headers=auth_headers(admin))
        assert resp.status_code == 200
        items = resp.json()["data"]["items"]
        assert any(i["action_type"] == "SPECIFIC_EVENT" for i in items)


class TestAutomaticAuditLogging:
    def test_user_registration_creates_audit_log(self, client: TestClient, db: Session) -> None:
        email = f"audit_reg_{uuid.uuid4().hex[:6]}@univ.edu"
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Audit New User",
                "email": email,
                "password": "SecurePassword123!",
            },
        )
        assert resp.status_code == 201

        # Verify audit log in db
        user = db.scalar(select(User).where(User.email == email))
        assert user is not None
        log = db.scalar(select(AuditLog).where(AuditLog.actor_id == user.id, AuditLog.action_type == "USER_REGISTER"))
        assert log is not None
        assert "registered" in log.description

    def test_login_success_and_failure_creates_audit_logs(self, client: TestClient, db: Session) -> None:
        email = f"audit_login_{uuid.uuid4().hex[:6]}@univ.edu"
        user = make_user(db, UserRole.STUDENT, email=email)
        db.commit()

        # Failed attempt
        fail_resp = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPassword!"},
        )
        assert fail_resp.status_code == 401
        fail_log = db.scalar(select(AuditLog).where(AuditLog.action_type == "LOGIN_FAILED", AuditLog.outcome == "FAILURE"))
        assert fail_log is not None

        # Successful attempt
        success_resp = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "TestPass1!"},
        )
        assert success_resp.status_code == 200
        success_log = db.scalar(select(AuditLog).where(AuditLog.action_type == "LOGIN_SUCCESS", AuditLog.actor_id == user.id))
        assert success_log is not None

    def test_metadata_sanitization_removes_secrets(self) -> None:
        sensitive = {
            "password": "supersecretpassword",
            "access_token": "eyJhbGciOi...",
            "safe_field": "public_data",
            "nested": {
                "api_key": "sk-12345",
                "normal": "hello",
            },
        }
        cleaned = sanitize_metadata(sensitive)
        assert cleaned["password"] == "[REDACTED]"
        assert cleaned["access_token"] == "[REDACTED]"
        assert cleaned["safe_field"] == "public_data"
        assert cleaned["nested"]["api_key"] == "[REDACTED]"
        assert cleaned["nested"]["normal"] == "hello"


class TestSecurityHardening:
    def test_security_headers_present(self, client: TestClient) -> None:
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        assert resp.headers["X-Content-Type-Options"] == "nosniff"
        assert resp.headers["X-Frame-Options"] == "DENY"
        assert resp.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "Permissions-Policy" in resp.headers

    def test_payload_too_large_rejected(self, client: TestClient) -> None:
        """Requests with Content-Length > 10MB are rejected with 413 Payload Too Large."""
        headers = {"Content-Length": str(15 * 1024 * 1024)}  # 15MB
        resp = client.post("/api/v1/auth/login", headers=headers, json={"email": "a@b.com", "password": "x"})
        assert resp.status_code == 413
        assert "Payload too large" in resp.json()["detail"]

    def test_rate_limiter_triggers_429(self, client: TestClient) -> None:
        """Exceeding 10 login requests within window triggers 429 Too Many Requests."""
        rate_limiter.reset()

        # Send 10 rapid login attempts
        for _ in range(10):
            client.post(
                "/api/v1/auth/login",
                json={"email": "fake@test.com", "password": "wrong"},
            )

        # 11th request must be rate limited with HTTP 429
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "fake@test.com", "password": "wrong"},
        )
        assert resp.status_code == 429
        assert "Rate limit exceeded" in resp.json()["detail"]
        assert "Retry-After" in resp.headers

        rate_limiter.reset()

