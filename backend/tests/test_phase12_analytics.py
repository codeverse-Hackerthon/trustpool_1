"""Phase 12 — Analytics and Reporting Test Suite.

Verifies:
1. Student analytics: personal usage, active bookings, data isolation between students.
2. Owner analytics: asset utilization, top used resources, status distribution, role authorization.
3. Admin analytics: platform overview, user growth, incident breakdown, institutional stats, RBAC.
4. Legacy dashboard: backwards compatibility with frontend.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentType
from app.models.institution import Institution, InstitutionType, VerificationStatus
from app.models.resource import Resource, ResourceStatus, ResourceType
from app.models.user import User, UserRole
from tests.conftest import auth_headers, make_booking, make_resource, make_user


class TestStudentAnalytics:
    def test_student_overview(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)

        # 1 active, 1 completed, 1 pending
        make_booking(db, student, res, BookingStatus.ACTIVE)
        make_booking(db, student, res, BookingStatus.COMPLETED)
        make_booking(db, student, res, BookingStatus.PENDING)
        db.commit()

        resp = client.get("/api/v1/analytics/student/overview", headers=auth_headers(student))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["totalBookings"] == 3
        assert data["activeBookings"] == 1
        assert data["completedBookings"] == 1
        assert data["pendingRequests"] == 1
        assert data["cancelledBookings"] == 0
        assert data["totalResourceUsageHours"] > 0
        assert len(data["recentBookingActivity"]) == 3

    def test_student_data_isolation(self, client: TestClient, db: Session) -> None:
        """Student A cannot see Student B's booking counts."""
        student_a = make_user(db, UserRole.STUDENT)
        student_b = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)

        make_booking(db, student_a, res, BookingStatus.COMPLETED)
        make_booking(db, student_b, res, BookingStatus.ACTIVE)
        make_booking(db, student_b, res, BookingStatus.COMPLETED)
        db.commit()

        resp_a = client.get("/api/v1/analytics/student/overview", headers=auth_headers(student_a))
        assert resp_a.status_code == 200
        assert resp_a.json()["data"]["totalBookings"] == 1

        resp_b = client.get("/api/v1/analytics/student/overview", headers=auth_headers(student_b))
        assert resp_b.status_code == 200
        assert resp_b.json()["data"]["totalBookings"] == 2

    def test_student_usage_breakdown(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)

        make_booking(db, student, res, BookingStatus.COMPLETED)
        db.commit()

        resp = client.get("/api/v1/analytics/student/usage", headers=auth_headers(student))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "categoryUsage" in data
        assert "bookingFrequency" in data
        assert "usageOverTime" in data

    def test_student_activity_endpoint(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)

        make_booking(db, student, res, BookingStatus.COMPLETED)
        db.commit()

        resp = client.get("/api/v1/analytics/student/activity?limit=5", headers=auth_headers(student))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data) == 1
        assert data[0]["resourceTitle"] == res.name


class TestOwnerAnalytics:
    def test_owner_overview(self, client: TestClient, db: Session) -> None:
        owner = make_user(db, UserRole.OWNER)
        student = make_user(db, UserRole.STUDENT)
        res1 = make_resource(db, owner)
        res2 = make_resource(db, owner)

        make_booking(db, student, res1, BookingStatus.COMPLETED)
        make_booking(db, student, res1, BookingStatus.ACTIVE)
        make_booking(db, student, res2, BookingStatus.PENDING)
        db.commit()

        resp = client.get("/api/v1/analytics/owner/overview", headers=auth_headers(owner))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["totalResources"] == 2
        assert data["activeResources"] == 2
        assert data["pendingBookingRequests"] == 1
        assert data["completedBookings"] == 1
        assert len(data["mostFrequentlyUsedResources"]) > 0

    def test_owner_utilization_and_bookings(self, client: TestClient, db: Session) -> None:
        owner = make_user(db, UserRole.OWNER)
        student = make_user(db, UserRole.STUDENT)
        res = make_resource(db, owner)

        make_booking(db, student, res, BookingStatus.COMPLETED)
        db.commit()

        # Utilization
        u_resp = client.get("/api/v1/analytics/owner/utilization", headers=auth_headers(owner))
        assert u_resp.status_code == 200
        assert len(u_resp.json()["data"]) >= 1

        # Bookings trends
        b_resp = client.get("/api/v1/analytics/owner/bookings", headers=auth_headers(owner))
        assert b_resp.status_code == 200
        assert "trends" in b_resp.json()["data"]
        assert "statusDistribution" in b_resp.json()["data"]

    def test_owner_resources_performance(self, client: TestClient, db: Session) -> None:
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)
        db.commit()

        resp = client.get("/api/v1/analytics/owner/resources", headers=auth_headers(owner))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data) == 1
        assert data[0]["name"] == res.name
        assert "trustScore" in data[0]

    def test_student_forbidden_from_owner_analytics(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        db.commit()

        resp = client.get("/api/v1/analytics/owner/overview", headers=auth_headers(student))
        assert resp.status_code == 403


class TestAdminAnalytics:
    def test_admin_overview(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        res = make_resource(db, owner)
        make_booking(db, student, res, BookingStatus.COMPLETED)
        db.commit()

        resp = client.get("/api/v1/analytics/admin/overview", headers=auth_headers(admin))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["totalUsers"] >= 3
        assert data["totalStudents"] >= 1
        assert data["totalOwners"] >= 1
        assert data["totalAdmins"] >= 1
        assert data["totalResources"] >= 1
        assert data["totalBookings"] >= 1

    def test_admin_detailed_endpoints(self, client: TestClient, db: Session) -> None:
        admin = make_user(db, UserRole.ADMIN)
        db.commit()

        headers = auth_headers(admin)
        for ep in ["bookings", "users", "resources", "incidents", "institutions"]:
            resp = client.get(f"/api/v1/analytics/admin/{ep}", headers=headers)
            assert resp.status_code == 200, f"Failed for /admin/{ep}: {resp.text}"
            assert "data" in resp.json()

    def test_non_admin_forbidden_from_admin_analytics(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        owner = make_user(db, UserRole.OWNER)
        db.commit()

        assert client.get("/api/v1/analytics/admin/overview", headers=auth_headers(student)).status_code == 403
        assert client.get("/api/v1/analytics/admin/overview", headers=auth_headers(owner)).status_code == 403


class TestLegacyDashboard:
    def test_dashboard_endpoint(self, client: TestClient, db: Session) -> None:
        student = make_user(db, UserRole.STUDENT)
        db.commit()

        resp = client.get("/api/v1/analytics/dashboard", headers=auth_headers(student))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "metrics" in data
        assert "utilizationByCategory" in data
        assert "peakUsage" in data
        assert "fairnessDistribution" in data

