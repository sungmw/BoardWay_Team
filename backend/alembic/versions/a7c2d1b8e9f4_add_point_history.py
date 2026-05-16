"""add point history

Revision ID: a7c2d1b8e9f4
Revises: ef793f3d54fa
Create Date: 2026-05-16 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a7c2d1b8e9f4"
down_revision: Union[str, Sequence[str], None] = "ef793f3d54fa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "point_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_point_history_id"), "point_history", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_point_history_user_id"),
        "point_history",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_point_history_user_id"), table_name="point_history")
    op.drop_index(op.f("ix_point_history_id"), table_name="point_history")
    op.drop_table("point_history")
