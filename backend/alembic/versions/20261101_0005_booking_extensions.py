"""booking extension history
Revision ID: 20261101_0005
Revises: 20261101_0004
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
revision="20261101_0005";down_revision="20261101_0004";branch_labels=None;depends_on=None
def upgrade():
 status=postgresql.ENUM(name="booking_status",create_type=False)
 op.create_table("booking_extensions",sa.Column("id",postgresql.UUID(as_uuid=True),primary_key=True),sa.Column("booking_id",postgresql.UUID(as_uuid=True),sa.ForeignKey("bookings.id",ondelete="CASCADE"),nullable=False),sa.Column("requested_by",postgresql.UUID(as_uuid=True),sa.ForeignKey("users.id",ondelete="RESTRICT"),nullable=False),sa.Column("previous_end_at",sa.DateTime(timezone=True),nullable=False),sa.Column("requested_end_at",sa.DateTime(timezone=True),nullable=False),sa.Column("status",status,nullable=False,server_default="PENDING"),sa.Column("decision_notes",sa.Text()),sa.Column("decided_by",postgresql.UUID(as_uuid=True),sa.ForeignKey("users.id",ondelete="SET NULL")),sa.Column("decided_at",sa.DateTime(timezone=True)),sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.text("now()"),nullable=False),sa.Column("updated_at",sa.DateTime(timezone=True),server_default=sa.text("now()"),nullable=False),sa.CheckConstraint("requested_end_at > previous_end_at",name="ck_extensions_valid_end"));op.create_index("ix_booking_extensions_booking_id","booking_extensions",["booking_id"])
def downgrade():op.drop_table("booking_extensions")
