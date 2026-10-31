"""initial foundation tables

Revision ID: 20261101_0001
Revises:
Create Date: 2026-11-01 00:00:00
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20261101_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    institution_type = postgresql.ENUM("COLLEGE", "UNIVERSITY", "LABORATORY", "ORGANIZATION", "OTHER", name="institution_type", create_type=False)
    verification_status = postgresql.ENUM("PENDING", "VERIFIED", "REJECTED", name="verification_status", create_type=False)
    user_role = postgresql.ENUM("STUDENT", "OWNER", "ADMIN", name="user_role", create_type=False)
    account_status = postgresql.ENUM("ACTIVE", "INACTIVE", "SUSPENDED", name="account_status", create_type=False)
    resource_type = postgresql.ENUM("SPACE", "EQUIPMENT", name="resource_type", create_type=False)
    resource_status = postgresql.ENUM("ACTIVE", "INACTIVE", "UNDER_MAINTENANCE", name="resource_status", create_type=False)
    bind = op.get_bind()
    for enum in (institution_type, verification_status, user_role, account_status, resource_type, resource_status):
        enum.create(bind, checkfirst=True)
    op.create_table("institutions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("institution_type", institution_type, nullable=False), sa.Column("email_domain", sa.String(255)), sa.Column("address", sa.Text()), sa.Column("contact_email", sa.String(320)), sa.Column("verification_status", verification_status, nullable=False, server_default="PENDING"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_institutions_name", "institutions", ["name"])
    op.create_index("ix_institutions_email_domain", "institutions", ["email_domain"])
    op.create_index("ix_institutions_verification_status", "institutions", ["verification_status"])
    op.create_table("users", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("full_name", sa.String(255), nullable=False), sa.Column("email", sa.String(320), nullable=False), sa.Column("hashed_password", sa.String(255)), sa.Column("role", user_role, nullable=False, server_default="STUDENT"), sa.Column("phone_number", sa.String(32)), sa.Column("profile_image_url", sa.String(2048)), sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="SET NULL")), sa.Column("account_status", account_status, nullable=False, server_default="ACTIVE"), sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("email", name="uq_users_email"))
    for name, columns in (("ix_users_email", ["email"]), ("ix_users_role", ["role"]), ("ix_users_institution_id", ["institution_id"]), ("ix_users_account_status", ["account_status"])): op.create_index(name, "users", columns)
    op.create_table("resources", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("description", sa.Text()), sa.Column("category", sa.String(100), nullable=False), sa.Column("resource_type", resource_type, nullable=False), sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False), sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="SET NULL")), sa.Column("location", sa.String(255)), sa.Column("capacity", sa.Integer()), sa.Column("usage_instructions", sa.Text()), sa.Column("status", resource_status, nullable=False, server_default="ACTIVE"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.CheckConstraint("capacity IS NULL OR capacity > 0", name="ck_resources_capacity_positive"))
    for name, columns in (("ix_resources_name", ["name"]), ("ix_resources_category", ["category"]), ("ix_resources_resource_type", ["resource_type"]), ("ix_resources_owner_id", ["owner_id"]), ("ix_resources_institution_id", ["institution_id"]), ("ix_resources_status", ["status"])): op.create_index(name, "resources", columns)


def downgrade() -> None:
    op.drop_table("resources")
    op.drop_table("users")
    op.drop_table("institutions")
    bind = op.get_bind()
    for name in ("resource_status", "resource_type", "account_status", "user_role", "verification_status", "institution_type"):
        sa.Enum(name=name).drop(bind, checkfirst=True)
