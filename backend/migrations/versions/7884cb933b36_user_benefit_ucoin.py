"""User Benefit Ucoin

Revision ID: 7884cb933b36
Revises: 4b4b1f6aa1c1
Create Date: 2024-10-25 23:43:34.529399

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7884cb933b36'
down_revision: Union[str, None] = '4b4b1f6aa1c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('benefits', 'ucoin')
    op.drop_column('benefits', 'price')
    op.add_column('benefits', sa.Column('ucoin', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('ucoin', sa.Integer(), server_default='0', nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'ucoin')
    op.add_column('benefits', sa.Column('price', sa.INTEGER(), autoincrement=False, nullable=False))
    op.alter_column('benefits', 'ucoin',
               existing_type=sa.Integer(),
               type_=sa.BOOLEAN(),
               existing_nullable=False)
    # ### end Alembic commands ###
