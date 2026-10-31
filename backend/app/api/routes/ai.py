"""Phase 11 — AI-powered API endpoints.

Endpoints:
  GET  /ai/recommendations           — resource recommendations
  POST /ai/search                    — natural-language search
  POST /ai/incidents/{id}/summarize  — incident summary
  POST /ai/verification/assist       — verification document help
  POST /ai/usage/analyze             — admin usage anomaly detection (admin only)

Security:
  - OpenAI API key never leaves this module / ai_service.
  - All AI outputs are advisory and labeled as AI-generated.
  - No AI output triggers automated DB mutations.
  - Eligibility and authorization use deterministic backend logic only.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, require_roles
from app.core.database import get_db
from app.models.ai_analysis import AIAnalysis
from app.models.booking import Booking
from app.models.incident import ConditionReport, Incident, ReportType
from app.models.resource import Resource
from app.models.user import User, UserRole
from app.services import ai_service
from app.services.eligibility_service import evaluate_eligibility

router = APIRouter(prefix="/ai", tags=["AI Features"])


# ── 1. Resource Recommendations ───────────────────────────────────────────────

@router.get("/recommendations")
def recommend_resources(
    preferences: str | None = Query(None, max_length=500),
    category: str | None = Query(None),
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return AI-ranked resource recommendations filtered by eligibility."""
    # Deterministic eligibility filtering — AI only ranks, never decides
    resources = db.scalars(
        select(Resource).where(Resource.status == "ACTIVE").limit(50)
    ).all()

    eligible = []
    for r in resources:
        if evaluate_eligibility(db, user, r)["eligible"]:
            eligible.append({
                "id": str(r.id),
                "name": r.name,
                "category": r.category,
                "resource_type": r.resource_type.value,
                "location": r.location,
                "description": r.description,
            })

    if not eligible:
        return {"success": True, "data": {"recommendations": [], "ai_generated": True, "fallback": True}}

    user_context = {
        "institution_id": str(user.institution_id) if user.institution_id else None,
        "role": user.role.value,
        "preferences": preferences or "",
        "category_filter": category or "",
    }

    result = ai_service.generate_recommendations(user_context, eligible)

    # Store analysis record
    analysis = AIAnalysis(
        entity_type="recommendation",
        requested_by=user.id,
        analysis_type="RECOMMENDATION",
        model=result.model,
        result={"recommendations": [r.model_dump() for r in result.recommendations], "fallback": result.fallback},
    )
    db.add(analysis)
    db.commit()

    return {
        "success": True,
        "data": {
            "recommendations": [r.model_dump() for r in result.recommendations],
            "ai_generated": True,
            "fallback": result.fallback,
            "model": result.model,
        },
    }


# ── 2. Natural-Language Resource Search ──────────────────────────────────────

class NLSearchIn(BaseModel):
    query: str = Field(min_length=1, max_length=1000)


@router.post("/search")
def nl_search(
    payload: NLSearchIn,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Parse a natural-language query into search filters and return matching resources."""
    filters = ai_service.extract_search_filters(payload.query)

    if filters.clarification_needed:
        return {
            "success": True,
            "data": {
                "resources": [],
                "clarification_needed": True,
                "clarification_message": filters.clarification_message,
                "extracted_filters": filters.model_dump(exclude={"model"}),
            },
        }

    # Execute deterministic search using extracted filters
    from sqlalchemy import or_
    from app.models.resource import ResourceType, ResourceStatus

    q = select(Resource).where(Resource.status == ResourceStatus.ACTIVE)

    if filters.search:
        q = q.where(
            or_(
                Resource.name.ilike(f"%{filters.search}%"),
                Resource.description.ilike(f"%{filters.search}%"),
                Resource.category.ilike(f"%{filters.search}%"),
            )
        )
    if filters.category:
        q = q.where(Resource.category.ilike(f"%{filters.category}%"))
    if filters.location:
        q = q.where(Resource.location.ilike(f"%{filters.location}%"))
    if filters.resource_type:
        try:
            rt = ResourceType(filters.resource_type.upper())
            q = q.where(Resource.resource_type == rt)
        except ValueError:
            pass
    if filters.min_capacity:
        q = q.where(Resource.capacity >= filters.min_capacity)

    all_resources = db.scalars(q.limit(50)).all()

    # Eligibility filter — deterministic, AI cannot bypass this
    visible = []
    for r in all_resources:
        if user.role is UserRole.ADMIN or r.is_public or r.owner_id == user.id or (r.institution_only and r.institution_id == user.institution_id):
            if evaluate_eligibility(db, user, r)["eligible"]:
                visible.append({
                    "id": str(r.id),
                    "name": r.name,
                    "category": r.category,
                    "resource_type": r.resource_type.value,
                    "location": r.location,
                    "description": r.description,
                })

    return {
        "success": True,
        "data": {
            "resources": visible,
            "extracted_filters": filters.model_dump(exclude={"model"}),
            "ai_generated": True,
            "model": filters.model,
            "total": len(visible),
        },
    }


# ── 3. Incident Summary ───────────────────────────────────────────────────────

@router.post("/incidents/{incident_id}/summarize")
def summarize_incident(
    incident_id: uuid.UUID,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Generate an AI advisory summary of an incident."""
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found.")

    resource = db.get(Resource, incident.resource_id)
    is_authorized = (
        user.role is UserRole.ADMIN
        or user.id == incident.reported_by
        or (resource and resource.owner_id == user.id)
    )
    if not is_authorized:
        raise HTTPException(403, "Not authorized to request an AI summary for this incident.")

    # Build anonymized context — no names or emails
    condition_reports = db.scalars(
        select(ConditionReport).where(ConditionReport.booking_id == incident.booking_id)
    ).all() if incident.booking_id else []

    incident_data = {
        "incident_type": incident.incident_type,
        "title": incident.title,
        "description": incident.description,
        "severity": incident.severity.value,
        "status": incident.status.value,
        "evidence_count": len(incident.evidence_urls),
        "condition_reports": [
            {
                "report_type": r.report_type.value,
                "overall_condition": r.overall_condition,
                "description": r.description,
                "damage_detected": r.damage_detected,
            }
            for r in condition_reports
        ],
    }

    result = ai_service.summarize_incident(incident_data)

    # Persist as AI analysis (advisory record)
    analysis = AIAnalysis(
        entity_type="incident",
        entity_id=incident.id,
        requested_by=user.id,
        analysis_type="INCIDENT_SUMMARY",
        model=result.model,
        result=result.model_dump(),
    )
    db.add(analysis)

    # Also store on the incident for quick access
    incident.ai_summary = result.summary
    incident.ai_summary_model = result.model
    incident.ai_summary_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "success": True,
        "data": {
            **result.model_dump(),
            "disclaimer": "This is an AI-generated advisory summary. Human review is required before any action.",
        },
    }


# ── 4. Verification Document Assistance ──────────────────────────────────────

class VerificationAssistIn(BaseModel):
    verification_type: str = Field(min_length=1, max_length=64)
    description: str = Field(min_length=1, max_length=2000)
    rejection_reason: str | None = Field(None, max_length=1000)


@router.post("/verification/assist")
def verification_assist(
    payload: VerificationAssistIn,
    user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return AI guidance on verification document requirements."""
    result = ai_service.assist_verification(
        verification_type=payload.verification_type,
        description=payload.description,
        rejection_reason=payload.rejection_reason,
    )

    analysis = AIAnalysis(
        entity_type="verification",
        requested_by=user.id,
        analysis_type="VERIFICATION_ASSIST",
        model=result.model,
        result=result.model_dump(),
    )
    db.add(analysis)
    db.commit()

    return {
        "success": True,
        "data": {
            **result.model_dump(),
            "disclaimer": "AI guidance only. Verification approval requires human review.",
        },
    }


# ── 5. Usage Anomaly Detection ────────────────────────────────────────────────

@router.post("/usage/analyze")
def analyze_usage(
    user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    """Analyze booking patterns for anomalies. Admin only. Results are advisory."""
    from sqlalchemy import func
    from app.models.booking import Booking, BookingStatus

    # Aggregate anonymized statistics — no personal data in AI context
    cancellation_counts = db.execute(
        select(func.count(Booking.id).label("cnt"))
        .where(Booking.status == BookingStatus.CANCELLED)
    ).scalar() or 0

    overdue_counts = db.execute(
        select(func.count(Booking.id).label("cnt"))
        .where(Booking.status == BookingStatus.OVERDUE)
    ).scalar() or 0

    total_bookings = db.execute(
        select(func.count(Booking.id).label("cnt"))
    ).scalar() or 0

    stats = {
        "total_bookings": total_bookings,
        "cancellations": cancellation_counts,
        "overdue_returns": overdue_counts,
        "cancellation_rate": round(cancellation_counts / max(total_bookings, 1), 4),
        "overdue_rate": round(overdue_counts / max(total_bookings, 1), 4),
    }

    result = ai_service.analyze_usage_patterns(stats)

    analysis = AIAnalysis(
        entity_type="platform_usage",
        requested_by=user.id,
        analysis_type="USAGE_ANOMALY",
        model=result.model,
        result={**result.model_dump(), "input_stats": stats},
    )
    db.add(analysis)
    db.commit()

    return {
        "success": True,
        "data": {
            **result.model_dump(),
            "input_stats": stats,
            "disclaimer": "AI observations only. Human investigation is required before any action.",
        },
    }
