"""Phase 9 tests — Condition Reports and Incidents.

Mocks: Cloudinary upload
"""
from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.booking import BookingStatus
from app.models.incident import ConditionReport, Incident, IncidentSeverity, IncidentStatus, IncidentType, ReportType
from app.models.user import UserRole
from tests.conftest import auth_headers, make_booking, make_resource, make_user


# ── Condition Reports ─────────────────────────────────────────────────────────

class TestConditionReports:
    def test_submit_before_use_report(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.APPROVED)
        db.commit()

        response = client.post(
            "/api/v1/condition-reports",
            json={
                "booking_id": str(booking.id),
                "report_type": "BEFORE_USE",
                "overall_condition": "GOOD",
                "description": "No damage visible.",
                "damage_detected": False,
            },
            headers=auth_headers(student),
        )
        assert response.status_code == 201, response.text
        data = response.json()["data"]
        assert data["report_type"] == "BEFORE_USE"
        assert data["overall_condition"] == "GOOD"

    def test_submit_duplicate_report_rejected(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.APPROVED)
        db.commit()

        payload = {
            "booking_id": str(booking.id),
            "report_type": "BEFORE_USE",
            "overall_condition": "GOOD",
            "damage_detected": False,
        }
        r1 = client.post("/api/v1/condition-reports", json=payload, headers=auth_headers(student))
        assert r1.status_code == 201
        r2 = client.post("/api/v1/condition-reports", json=payload, headers=auth_headers(student))
        assert r2.status_code == 409

    def test_unauthorized_user_cannot_submit(self, client: TestClient, db: Session) -> None:
        other = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking_user = make_user(db, UserRole.STUDENT)
        booking = make_booking(db, booking_user, resource, BookingStatus.APPROVED)
        db.commit()

        response = client.post(
            "/api/v1/condition-reports",
            json={
                "booking_id": str(booking.id),
                "report_type": "BEFORE_USE",
                "overall_condition": "GOOD",
                "damage_detected": False,
            },
            headers=auth_headers(other),
        )
        assert response.status_code == 403

    def test_get_booking_reports(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.APPROVED)
        report = ConditionReport(
            id=uuid.uuid4(),
            booking_id=booking.id,
            resource_id=resource.id,
            submitted_by=student.id,
            report_type=ReportType.BEFORE_USE,
            overall_condition="GOOD",
            damage_detected=False,
            evidence_urls=[],
        )
        db.add(report)
        db.commit()

        response = client.get(
            f"/api/v1/bookings/{booking.id}/condition-reports",
            headers=auth_headers(student),
        )
        assert response.status_code == 200
        assert len(response.json()["data"]) == 1

    def test_invalid_overall_condition_rejected(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.APPROVED)
        db.commit()

        response = client.post(
            "/api/v1/condition-reports",
            json={
                "booking_id": str(booking.id),
                "report_type": "BEFORE_USE",
                "overall_condition": "PERFECT",  # invalid
                "damage_detected": False,
            },
            headers=auth_headers(student),
        )
        assert response.status_code == 422

    def test_image_upload_requires_cloudinary(self, client: TestClient, db: Session) -> None:
        """When Cloudinary is not configured, upload returns 503. When configured, 201."""
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.APPROVED)
        report = ConditionReport(
            id=uuid.uuid4(), booking_id=booking.id, resource_id=resource.id,
            submitted_by=student.id, report_type=ReportType.BEFORE_USE,
            overall_condition="GOOD", damage_detected=False, evidence_urls=[],
        )
        db.add(report)
        db.commit()

        import io
        # Mock storage to return 503 (unconfigured)
        from fastapi import HTTPException, status as http_status
        with patch(
            "app.api.routes.condition_reports.upload_image",
            side_effect=HTTPException(status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE, detail="Image storage is not configured."),
        ):
            response = client.post(
                f"/api/v1/condition-reports/{report.id}/images",
                files={"file": ("test.jpg", io.BytesIO(b"fake"), "image/jpeg")},
                headers=auth_headers(student),
            )
        assert response.status_code == 503


# ── Incidents ─────────────────────────────────────────────────────────────────

class TestIncidents:
    def test_create_incident(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        booking = make_booking(db, student, resource, BookingStatus.COMPLETED)
        db.commit()

        response = client.post(
            "/api/v1/incidents",
            json={
                "resource_id": str(resource.id),
                "booking_id": str(booking.id),
                "incident_type": "DAMAGE",
                "title": "Screen cracked",
                "description": "The monitor screen has a crack on the left side.",
                "severity": "HIGH",
            },
            headers=auth_headers(student),
        )
        assert response.status_code == 201, response.text
        data = response.json()["data"]
        assert data["status"] == "OPEN"
        assert data["severity"] == "HIGH"

    def test_my_incidents(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        incident = Incident(
            id=uuid.uuid4(), resource_id=resource.id, reported_by=student.id,
            incident_type="DAMAGE", title="Test", description="desc",
            severity=IncidentSeverity.LOW, status=IncidentStatus.OPEN, evidence_urls=[],
        )
        db.add(incident)
        db.commit()

        response = client.get("/api/v1/incidents/me", headers=auth_headers(student))
        assert response.status_code == 200
        assert len(response.json()["data"]) >= 1

    def test_unauthorized_user_cannot_view_incident(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        other = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        incident = Incident(
            id=uuid.uuid4(), resource_id=resource.id, reported_by=student.id,
            incident_type="DAMAGE", title="Test", description="desc",
            severity=IncidentSeverity.LOW, status=IncidentStatus.OPEN, evidence_urls=[],
        )
        db.add(incident)
        db.commit()

        response = client.get(f"/api/v1/incidents/{incident.id}", headers=auth_headers(other))
        assert response.status_code == 403

    def test_owner_cannot_resolve_incident(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        incident = Incident(
            id=uuid.uuid4(), resource_id=resource.id, reported_by=student.id,
            incident_type="DAMAGE", title="Test", description="desc",
            severity=IncidentSeverity.LOW, status=IncidentStatus.OPEN, evidence_urls=[],
        )
        db.add(incident)
        db.commit()

        response = client.patch(
            f"/api/v1/incidents/{incident.id}/status",
            json={"status": "RESOLVED"},
            headers=auth_headers(owner),
        )
        assert response.status_code == 403

    def test_admin_can_resolve_incident(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        incident = Incident(
            id=uuid.uuid4(), resource_id=resource.id, reported_by=student.id,
            incident_type="DAMAGE", title="Test", description="desc",
            severity=IncidentSeverity.LOW, status=IncidentStatus.UNDER_REVIEW, evidence_urls=[],
        )
        db.add(incident)
        db.commit()

        response = client.post(
            f"/api/v1/incidents/{incident.id}/resolve",
            json={"resolution_notes": "Verified and resolved after inspection."},
            headers=auth_headers(admin),
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "RESOLVED"

    def test_admin_only_sees_all_incidents(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        response = client.get("/api/v1/incidents/admin/all", headers=auth_headers(student))
        assert response.status_code == 403

    def test_status_change_updates_incident(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        resource = make_resource(db, owner)
        incident = Incident(
            id=uuid.uuid4(), resource_id=resource.id, reported_by=student.id,
            incident_type="MISUSE", title="Test", description="desc",
            severity=IncidentSeverity.MEDIUM, status=IncidentStatus.OPEN, evidence_urls=[],
        )
        db.add(incident)
        db.commit()

        response = client.patch(
            f"/api/v1/incidents/{incident.id}/status",
            json={"status": "UNDER_REVIEW", "notes": "Investigating."},
            headers=auth_headers(admin),
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "UNDER_REVIEW"
