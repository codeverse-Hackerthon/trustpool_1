import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.resources import router as resources_router
from app.api.routes.users import router as users_router
from app.api.routes.institutions import router as institutions_router
from app.api.routes.verifications import router as verifications_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.allocation import router as allocation_router
from app.api.routes.analytics import router as analytics_router
# Phase 9
from app.api.routes.condition_reports import router as condition_reports_router
from app.api.routes.incidents import router as incidents_router
# Phase 10
from app.api.routes.notifications import router as notifications_router
from app.api.routes.websockets import router as websockets_router
from app.api.routes.admin import router as admin_router
# Phase 11
from app.api.routes.ai import router as ai_router
# Phase 13
from app.api.routes.audit_logs import router as audit_logs_router
from app.core.config import get_settings
from app.core.database import dispose_engine
from app.core.logging import configure_logging
from app.core.security_middleware import SecurityMiddleware

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting %s in %s", settings.app_name, settings.app_env)
    yield
    dispose_engine()
    logger.info("Shut down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description="Backend for institutional resource sharing — Phases 1–11.",
    version="0.11.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityMiddleware)

# Phases 1–8
app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(resources_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
app.include_router(institutions_router, prefix=settings.api_v1_prefix)
app.include_router(verifications_router, prefix=settings.api_v1_prefix)
app.include_router(bookings_router, prefix=settings.api_v1_prefix)
app.include_router(allocation_router, prefix=settings.api_v1_prefix)
app.include_router(analytics_router, prefix=settings.api_v1_prefix)

# Phase 9 — Condition Monitoring & Incident Management
app.include_router(condition_reports_router, prefix=settings.api_v1_prefix)
app.include_router(incidents_router, prefix=settings.api_v1_prefix)

# Phase 10 — Notifications & Real-time Updates
app.include_router(notifications_router, prefix=settings.api_v1_prefix)
app.include_router(websockets_router, prefix=settings.api_v1_prefix)
app.include_router(admin_router, prefix=settings.api_v1_prefix)

# Phase 11 — AI Features
app.include_router(ai_router, prefix=settings.api_v1_prefix)

# Phase 13 — Audit Logs
app.include_router(audit_logs_router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["Health"], summary="API welcome")
def root() -> dict[str, str]:
    return {"application": settings.app_name, "status": "online"}


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": "Request validation failed.", "errors": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled application error: %s", type(exc).__name__)
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
