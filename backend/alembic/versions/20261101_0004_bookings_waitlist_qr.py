"""booking, waitlist, and QR foundation

Revision ID: 20261101_0004
Revises: 20261101_0003
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20261101_0004"
down_revision = "20261101_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    booking_status = postgresql.ENUM("PENDING", "APPROVED", "REJECTED", "CANCELLED", "ACTIVE", "COMPLETED", "OVERDUE", name="booking_status", create_type=False)
    waitlist_status = postgresql.ENUM("WAITING", "PROMOTED", "CANCELLED", "EXPIRED", name="waitlist_status", create_type=False)
    bind = op.get_bind()
    booking_status.create(bind, checkfirst=True)
    waitlist_status.create(bind, checkfirst=True)
    op.create_table("bookings", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False), sa.Column("resource_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("resources.id", ondelete="RESTRICT"), nullable=False), sa.Column("start_at", sa.DateTime(timezone=True), nullable=False), sa.Column("end_at", sa.DateTime(timezone=True), nullable=False), sa.Column("purpose", sa.Text(), nullable=False), sa.Column("status", booking_status, nullable=False, server_default="PENDING"), sa.Column("requires_approval", sa.Boolean(), nullable=False), sa.Column("owner_notes", sa.Text()), sa.Column("decided_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")), sa.Column("cancellation_reason", sa.Text()), sa.Column("checked_in_at", sa.DateTime(timezone=True)), sa.Column("checked_out_at", sa.DateTime(timezone=True)), sa.Column("return_confirmed_at", sa.DateTime(timezone=True)), sa.Column("return_confirmed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")), sa.Column("return_notes", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.CheckConstraint("end_at > start_at", name="ck_bookings_valid_period"))
    for name, columns in (("ix_bookings_user_id", ["user_id"]), ("ix_bookings_resource_id", ["resource_id"]), ("ix_bookings_start_at", ["start_at"]), ("ix_bookings_end_at", ["end_at"]), ("ix_bookings_status", ["status"])): op.create_index(name, "bookings", columns)
    op.create_table("waitlist_entries", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("resource_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("resources.id", ondelete="CASCADE"), nullable=False), sa.Column("desired_start_at", sa.DateTime(timezone=True), nullable=False), sa.Column("desired_end_at", sa.DateTime(timezone=True), nullable=False), sa.Column("priority_score", sa.Float(), nullable=False), sa.Column("queue_position", sa.Integer(), nullable=False), sa.Column("status", waitlist_status, nullable=False, server_default="WAITING"), sa.Column("promotion_reason", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("user_id", "resource_id", "desired_start_at", "desired_end_at", name="uq_waitlist_slot"), sa.CheckConstraint("desired_end_at > desired_start_at", name="ck_waitlist_valid_period"))
    op.create_index("ix_waitlist_entries_user_id", "waitlist_entries", ["user_id"]); op.create_index("ix_waitlist_entries_resource_id", "waitlist_entries", ["resource_id"])
    op.create_table("booking_qr_tokens", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("booking_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False), sa.Column("token_hash", sa.String(64), nullable=False, unique=True), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("used_at", sa.DateTime(timezone=True)), sa.Column("revoked_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_booking_qr_tokens_booking_id", "booking_qr_tokens", ["booking_id"])


def downgrade() -> None:
    op.drop_table("booking_qr_tokens")
    op.drop_table("waitlist_entries")
    op.drop_table("bookings")
    bind = op.get_bind()
    postgresql.ENUM(name="waitlist_status").drop(bind, checkfirst=True)
    postgresql.ENUM(name="booking_status").drop(bind, checkfirst=True)
