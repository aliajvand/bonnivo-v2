"""add_user_cart_items

Revision ID: e4871c89012a
Revises: fb49234a3601
Create Date: 2026-10-04 11:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4871c89012a'
down_revision: Union[str, None] = 'fb49234a3601'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_cart_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('offer_id', sa.String(length=36), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('pet_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['offer_id'], ['seller_offers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_cart_items_user_id'), 'user_cart_items', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_cart_items_user_id'), table_name='user_cart_items')
    op.drop_table('user_cart_items')
