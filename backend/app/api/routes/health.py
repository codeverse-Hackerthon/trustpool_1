import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="API health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"status": "healthy", "application": settings.app_name, "environment": settings.app_env, "api_version": settings.api_v1_prefix}


@router.get("/db", summary="Database health")
def database_health(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.warning("Database health check failed", exc_info=True)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database is currently unavailable.")
    return {"status": "healthy", "database": "reachable"}
