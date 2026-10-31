"""Shared fixtures for Phase 9/10/11 tests.

All external service calls (Cloudinary, OpenAI) are mocked.
Database interactions use the real SQLAlchemy models against an in-memory SQLite
(or stubbed Session) approach via dependency overrides.
"""
from __future__ import annotations

import uuid
from collections.abc import Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import get_db
from app.main import app
from app.models.base import Base
from app.models.booking import Booking, BookingStatus
from app.models.incident import ConditionReport, Incident, IncidentSeverity, IncidentStatus, IncidentType, ReportType
from app.models.institution import Institution, InstitutionType, VerificationStatus
from app.models.notification import Notification, NotificationType
from app.models.resource import Resource, ResourceStatus, ResourceType
from app.models.user import AccountStatus, User, UserRole
from app.services.security import create_access_token, hash_password


# ── SQLite in-memory test database ───────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)

# Enable UUID support for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once per test session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def reset_rate_limits():
    """Ensure in-memory rate limiter is reset between each test."""
    from app.core.security_middleware import rate_limiter
    rate_limiter.reset()
    yield
    rate_limiter.reset()


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    """Provide a transactional test session that rolls back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    """TestClient with the real DB dependency overridden to the test session."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ── Test object factories ─────────────────────────────────────────────────────

def make_user(
    db: Session,
    role: UserRole = UserRole.STUDENT,
    email: str | None = None,
    institution_id: uuid.UUID | None = None,
) -> User:
    user = User(
        id=uuid.uuid4(),
        full_name="Test User",
        email=email or f"user_{uuid.uuid4().hex[:8]}@test.com",
        hashed_password=hash_password("TestPass1!"),
        role=role,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
        institution_id=institution_id,
    )
    db.add(user)
    db.flush()
    return user


def make_resource(db: Session, owner: User) -> Resource:
    resource = Resource(
        id=uuid.uuid4(),
        name="Test Resource",
        category="Equipment",
        resource_type=ResourceType.EQUIPMENT,
        owner_id=owner.id,
        status=ResourceStatus.ACTIVE,
        requires_approval=True,
        requires_training=False,
        is_public=True,
        institution_only=False,
        required_verification_types=[],
        specifications={},
        rules={},
        deposit_amount=0,
    )
    db.add(resource)
    db.flush()
    return resource


def make_booking(
    db: Session,
    user: User,
    resource: Resource,
    status: BookingStatus = BookingStatus.APPROVED,
) -> Booking:
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    booking = Booking(
        id=uuid.uuid4(),
        user_id=user.id,
        resource_id=resource.id,
        start_at=now + timedelta(hours=1),
        end_at=now + timedelta(hours=3),
        purpose="Test purpose",
        status=status,
        requires_approval=True,
    )
    db.add(booking)
    db.flush()
    return booking


def auth_headers(user: User) -> dict[str, str]:
    token, _, _ = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}
