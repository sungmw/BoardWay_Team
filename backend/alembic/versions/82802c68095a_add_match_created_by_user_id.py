"""add match created_by_user_id

Revision ID: 82802c68095a
Revises: 03aadc0ea567
Create Date: 2026-05-16 20:20:10.081525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82802c68095a'
down_revision: Union[str, Sequence[str], None] = '03aadc0ea567'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite 는 ALTER TABLE 로 FK 추가 못 함. batch_alter_table 의 copy-and-move 전략 필요.
    with op.batch_alter_table('matches') as batch_op:
        batch_op.add_column(sa.Column('created_by_user_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_matches_created_by_user_id', 'users', ['created_by_user_id'], ['id']
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('matches') as batch_op:
        batch_op.drop_constraint('fk_matches_created_by_user_id', type_='foreignkey')
        batch_op.drop_column('created_by_user_id')
