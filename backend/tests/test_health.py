from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from app.core.database import get_db
from app.main import app


class HealthySession:
    def execute(self, _: object) -> None:
        return None

    def close(self) -> None:
        return None


class FailingSession:
    def execute(self, _: object) -> None:
        raise OperationalError("SELECT 1", {}, Exception("connection unavailable"))

    def close(self) -> None:
        return None


def healthy_db_override() -> Generator[HealthySession, None, None]:
    yield HealthySession()


def failing_db_override() -> Generator[FailingSession, None, None]:
    yield FailingSession()


def test_root_returns_welcome() -> None:
    with TestClient(app) as client:
        response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_health_returns_application_status() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["api_version"] == "/api/v1"


def test_database_health_when_available() -> None:
    app.dependency_overrides[get_db] = healthy_db_override
    try:
        with TestClient(app) as client:
            response = client.get("/api/v1/health/db")
        assert response.status_code == 200
        assert response.json()["database"] == "reachable"
    finally:
        app.dependency_overrides.clear()


def test_database_health_hides_connection_failure() -> None:
    app.dependency_overrides[get_db] = failing_db_override
    try:
        with TestClient(app, raise_server_exceptions=False) as client:
            response = client.get("/api/v1/health/db")
        assert response.status_code == 503
        assert response.json() == {"detail": "Database is currently unavailable."}
    finally:
        app.dependency_overrides.clear()
