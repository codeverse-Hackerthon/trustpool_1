"""AI service — all OpenAI interactions are isolated here.

Rules:
- Never expose OPENAI_API_KEY outside this module.
- AI results are advisory; they never drive automated database mutations.
- Graceful fallback when AI is disabled or unavailable.
- Structured output validated through Pydantic.
- Timeouts enforced on every call.
- No sensitive personal information in prompts.
"""
from __future__ import annotations

import json
import logging
import time
from typing import Any

from pydantic import BaseModel, Field

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_AI_TIMEOUT = 30  # seconds


# ── Pydantic schemas for AI outputs ──────────────────────────────────────────

class RecommendationItem(BaseModel):
    resource_id: str
    reason: str = Field(max_length=500)


class RecommendationResult(BaseModel):
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    fallback: bool = False
    model: str = ""


class SearchFilters(BaseModel):
    category: str | None = None
    resource_type: str | None = None
    location: str | None = None
    institution_id: str | None = None
    min_capacity: int | None = None
    search: str | None = None
    desired_date: str | None = None
    desired_start_time: str | None = None
    desired_end_time: str | None = None
    clarification_needed: bool = False
    clarification_message: str | None = None
    model: str = ""


class IncidentSummaryResult(BaseModel):
    summary: str = Field(max_length=2000)
    observations: list[str] = Field(default_factory=list)
    ai_generated: bool = True
    model: str = ""
    generated_at: str = ""


class VerificationAssistResult(BaseModel):
    explanation: str = Field(max_length=3000)
    missing_items: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    ai_generated: bool = True
    model: str = ""


class UsageAnomalyResult(BaseModel):
    observations: list[str] = Field(default_factory=list)
    risk_level: str = "LOW"
    explanation: str = Field(max_length=2000)
    requires_human_review: bool = True
    ai_generated: bool = True
    model: str = ""


# ── Internal helper ───────────────────────────────────────────────────────────

def _is_available() -> bool:
    settings = get_settings()
    return bool(settings.ai_enabled and settings.openai_api_key)


def _client():
    """Return an OpenAI client. Only call after _is_available() check."""
    from openai import OpenAI
    settings = get_settings()
    return OpenAI(api_key=settings.openai_api_key.get_secret_value(), timeout=_AI_TIMEOUT)


def _model() -> str:
    return get_settings().ai_model or "gpt-4.1-mini"


def _chat(messages: list[dict], response_format: str = "text", max_tokens: int = 800) -> str:
    """Call OpenAI chat completions. Returns the assistant message as a string."""
    client = _client()
    kwargs: dict[str, Any] = dict(model=_model(), messages=messages, max_tokens=max_tokens)
    if response_format == "json":
        kwargs["response_format"] = {"type": "json_object"}
    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""


# ── Public API ────────────────────────────────────────────────────────────────

def generate_recommendations(
    user_context: dict,
    candidate_resources: list[dict],
) -> RecommendationResult:
    """Rank and explain candidate resources for a user. Candidates already filtered by eligibility."""
    if not _is_available():
        logger.info("AI disabled — returning deterministic fallback recommendations")
        top = candidate_resources[:5]
        return RecommendationResult(
            recommendations=[RecommendationItem(resource_id=str(r["id"]), reason="Matches your institution and availability.") for r in top],
            fallback=True,
            model="fallback",
        )
    try:
        prompt = (
            "You are a resource recommendation assistant. "
            "Given the user context and a list of candidate resources, "
            "return a JSON object with key 'recommendations' — "
            "an array of objects with 'resource_id' (string UUID) and 'reason' (≤100 chars). "
            "Return at most 5 recommendations. Only include resource_ids from the candidates list. "
            "Do not invent resource IDs.\n\n"
            f"User context: {json.dumps(user_context, default=str)}\n"
            f"Candidates: {json.dumps(candidate_resources, default=str)}"
        )
        raw = _chat([{"role": "user", "content": prompt}], response_format="json")
        data = json.loads(raw)
        recs = [RecommendationItem(**r) for r in data.get("recommendations", [])]
        # Validate: only IDs from candidates
        valid_ids = {str(r["id"]) for r in candidate_resources}
        recs = [r for r in recs if r.resource_id in valid_ids]
        return RecommendationResult(recommendations=recs, model=_model())
    except Exception as exc:
        logger.error("AI recommendation failed: %s", exc)
        return RecommendationResult(fallback=True, model="fallback")


def extract_search_filters(natural_query: str) -> SearchFilters:
    """Parse a natural-language search query into structured filters."""
    if not _is_available():
        return SearchFilters(search=natural_query, fallback=False, model="fallback", clarification_needed=False)  # type: ignore[call-arg]
    try:
        system = (
            "You are a search filter extraction assistant for an institutional resource booking platform. "
            "Extract structured search parameters from the user query. "
            "Return a JSON object with these optional keys: "
            "category (string), resource_type (SPACE or EQUIPMENT), location (string), "
            "min_capacity (integer), search (string keywords), desired_date (YYYY-MM-DD), "
            "desired_start_time (HH:MM), desired_end_time (HH:MM), "
            "clarification_needed (bool), clarification_message (string if clarification_needed). "
            "If important information is missing (e.g. date), set clarification_needed=true. "
            "Do not invent institution_id values."
        )
        raw = _chat(
            [{"role": "system", "content": system}, {"role": "user", "content": natural_query}],
            response_format="json",
        )
        data = json.loads(raw)
        data["model"] = _model()
        return SearchFilters(**{k: v for k, v in data.items() if k in SearchFilters.model_fields})
    except Exception as exc:
        logger.error("AI search filter extraction failed: %s", exc)
        return SearchFilters(search=natural_query, model="fallback")


def summarize_incident(incident_data: dict) -> IncidentSummaryResult:
    """Generate an advisory summary of an incident and its condition reports."""
    if not _is_available():
        return IncidentSummaryResult(
            summary="AI is not available. Please review the incident details manually.",
            ai_generated=True,
            model="fallback",
            generated_at=str(time.time()),
        )
    try:
        system = (
            "You are an incident review assistant for a resource-sharing platform. "
            "Summarize the incident concisely and list key observations. "
            "This is advisory only — do not determine fault or suggest penalties. "
            "Return JSON with keys: summary (string ≤500 chars), observations (list of strings ≤5 items). "
            "Do not include personal identifiable information."
        )
        prompt = json.dumps(incident_data, default=str)
        raw = _chat(
            [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            response_format="json",
            max_tokens=600,
        )
        data = json.loads(raw)
        from datetime import datetime, timezone
        return IncidentSummaryResult(
            summary=data.get("summary", "")[:2000],
            observations=data.get("observations", [])[:5],
            ai_generated=True,
            model=_model(),
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        logger.error("AI incident summary failed: %s", exc)
        return IncidentSummaryResult(
            summary="AI summary generation failed. Please review manually.",
            model="error",
            generated_at="",
        )


def assist_verification(
    verification_type: str,
    description: str,
    rejection_reason: str | None,
) -> VerificationAssistResult:
    """Help a user understand verification requirements and identify missing information."""
    if not _is_available():
        return VerificationAssistResult(
            explanation="AI assistance is not available. Please contact support.",
            model="fallback",
        )
    try:
        system = (
            "You are a verification assistance guide for an institutional resource platform. "
            "Help the user understand what documents are required for their verification type, "
            "identify what might be missing, and provide clear next steps. "
            "NEVER claim a document is authentic or automatically approve anything. "
            "Return JSON: explanation (string ≤800 chars), missing_items (list ≤5), next_steps (list ≤5)."
        )
        prompt = (
            f"Verification type: {verification_type}\n"
            f"User description: {description[:1000]}\n"
            + (f"Rejection reason: {rejection_reason[:500]}\n" if rejection_reason else "")
        )
        raw = _chat(
            [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            response_format="json",
            max_tokens=600,
        )
        data = json.loads(raw)
        return VerificationAssistResult(
            explanation=data.get("explanation", "")[:3000],
            missing_items=data.get("missing_items", [])[:5],
            next_steps=data.get("next_steps", [])[:5],
            ai_generated=True,
            model=_model(),
        )
    except Exception as exc:
        logger.error("AI verification assist failed: %s", exc)
        return VerificationAssistResult(
            explanation="AI assistance failed. Please contact support.",
            model="error",
        )


def analyze_usage_patterns(anonymized_stats: dict) -> UsageAnomalyResult:
    """Produce advisory anomaly observations from anonymized usage statistics.

    Stats must be pre-anonymized by the caller. This function never sees names or emails.
    """
    if not _is_available():
        return UsageAnomalyResult(
            observations=["AI analysis is not available."],
            explanation="Configure OPENAI_API_KEY and AI_ENABLED=true to enable analysis.",
            model="fallback",
        )
    try:
        system = (
            "You are a usage pattern analyst for a resource-sharing platform. "
            "Review the anonymized booking statistics and identify potential anomalies. "
            "These are observations only — do not suggest suspending any user. "
            "Human investigation is always required before any action. "
            "Return JSON: observations (list ≤5 strings), risk_level (LOW|MEDIUM|HIGH), explanation (string ≤500)."
        )
        prompt = json.dumps(anonymized_stats, default=str)
        raw = _chat(
            [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            response_format="json",
            max_tokens=500,
        )
        data = json.loads(raw)
        risk = data.get("risk_level", "LOW")
        if risk not in ("LOW", "MEDIUM", "HIGH"):
            risk = "LOW"
        return UsageAnomalyResult(
            observations=data.get("observations", [])[:5],
            risk_level=risk,
            explanation=data.get("explanation", "")[:2000],
            requires_human_review=True,
            ai_generated=True,
            model=_model(),
        )
    except Exception as exc:
        logger.error("AI usage analysis failed: %s", exc)
        return UsageAnomalyResult(
            observations=["Analysis failed."],
            explanation=str(exc)[:200],
            model="error",
        )
