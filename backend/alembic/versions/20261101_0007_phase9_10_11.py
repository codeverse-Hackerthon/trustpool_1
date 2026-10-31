"""Phase 9/10/11 — condition reports, incidents, notifications, AI analyses.

Revision ID: 20261101_0007
Revises: 20261101_0006
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20261101_0007"
down_revision = "20261101_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    # ── Enums (all create_type=False so they are created manually here) ──────
    report_type_enum = postgresql.ENUM(
        "BEFORE_USE", "AFTER_USE",
        name="report_type", create_type=False,
    )
    incident_severity_enum = postgresql.ENUM(
        "LOW", "MEDIUM", "HIGH", "CRITICAL",
        name="incident_severity", create_type=False,
    )
    incident_status_enum = postgresql.ENUM(
        "OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED",
        name="incident_status", create_type=False,
    )

    # Migration 0006 already created these three enums; ensure they exist.
    for e in (report_type_enum, incident_severity_enum, incident_status_enum):
        e.create(bind, checkfirst=True)

    # ── condition_reports ─────────────────────────────────────────────────────
    # Table was first created in 0006; we only add the new ai_summary columns.
    conn = bind
    inspector = sa.inspect(conn)
    existing_cr_cols = {c["name"] for c in inspector.get_columns("condition_reports")}
    if "ai_summary" not in existing_cr_cols:
        op.add_column("condition_reports", sa.Column("ai_summary", sa.Text(), nullable=True))
    if "ai_summary_model" not in existing_cr_cols:
        op.add_column("condition_reports", sa.Column("ai_summary_model", sa.String(64), nullable=True))
    if "ai_summary_at" not in existing_cr_cols:
        op.add_column("condition_reports", sa.Column("ai_summary_at", sa.DateTime(timezone=True), nullable=True))

    # ── incidents ─────────────────────────────────────────────────────────────
    # Table was first created in 0006; we only add the new ai columns.
    existing_inc_cols = {c["name"] for c in inspector.get_columns("incidents")}
    if "ai_summary" not in existing_inc_cols:
        op.add_column("incidents", sa.Column("ai_summary", sa.Text(), nullable=True))
    if "ai_summary_model" not in existing_inc_cols:
        op.add_column("incidents", sa.Column("ai_summary_model", sa.String(64), nullable=True))
    if "ai_summary_at" not in existing_inc_cols:
        op.add_column("incidents", sa.Column("ai_summary_at", sa.DateTime(timezone=True), nullable=True))

    # ── ai_analyses ───────────────────────────────────────────────────────────
    if "ai_analyses" not in inspector.get_table_names():
        op.create_table(
            "ai_analyses",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("entity_type", sa.String(64), nullable=False),
            sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("requested_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("analysis_type", sa.String(64), nullable=False),
            sa.Column("model", sa.String(64), nullable=False),
            sa.Column("result", postgresql.JSONB(), nullable=False, server_default="{}"),
            sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("reviewer_notes", sa.Text(), nullable=True),
            sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("human_accepted", sa.Boolean(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        )
        op.create_index("ix_ai_analyses_entity_type", "ai_analyses", ["entity_type"])
        op.create_index("ix_ai_analyses_entity_id", "ai_analyses", ["entity_id"])
        op.create_index("ix_ai_analyses_analysis_type", "ai_analyses", ["analysis_type"])


def downgrade() -> None:
    op.drop_table("ai_analyses")
    for col in ("ai_summary", "ai_summary_model", "ai_summary_at"):
        op.drop_column("incidents", col)
        op.drop_column("condition_reports", col)
