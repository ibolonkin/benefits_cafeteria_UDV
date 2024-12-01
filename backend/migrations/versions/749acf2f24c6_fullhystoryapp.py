"""FullHystoryApp

Revision ID: 749acf2f24c6
Revises: a3b1f37650ed
Create Date: 2024-11-26 18:10:40.044494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '749acf2f24c6'
down_revision: Union[str, None] = 'a3b1f37650ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('stat_history_benefits',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('benefit_name', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('create_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('delete_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stat_history_benefits_benefit_name'), 'stat_history_benefits', ['benefit_name'], unique=False)
    op.create_index(op.f('ix_stat_history_benefits_id'), 'stat_history_benefits', ['id'], unique=False)
    op.create_index(op.f('ix_stat_history_benefits_status'), 'stat_history_benefits', ['status'], unique=False)
    op.create_table('stat_history_user_benefits',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_Fio', sa.String(), nullable=False),
    sa.Column('benefit_name', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('create_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('delete_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stat_history_user_benefits_benefit_name'), 'stat_history_user_benefits', ['benefit_name'], unique=False)
    op.create_index(op.f('ix_stat_history_user_benefits_id'), 'stat_history_user_benefits', ['id'], unique=False)
    op.create_index(op.f('ix_stat_history_user_benefits_status'), 'stat_history_user_benefits', ['status'], unique=False)
    op.create_index(op.f('ix_stat_history_user_benefits_user_Fio'), 'stat_history_user_benefits', ['user_Fio'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_stat_history_user_benefits_user_Fio'), table_name='stat_history_user_benefits')
    op.drop_index(op.f('ix_stat_history_user_benefits_status'), table_name='stat_history_user_benefits')
    op.drop_index(op.f('ix_stat_history_user_benefits_id'), table_name='stat_history_user_benefits')
    op.drop_index(op.f('ix_stat_history_user_benefits_benefit_name'), table_name='stat_history_user_benefits')
    op.drop_table('stat_history_user_benefits')
    op.drop_index(op.f('ix_stat_history_benefits_status'), table_name='stat_history_benefits')
    op.drop_index(op.f('ix_stat_history_benefits_id'), table_name='stat_history_benefits')
    op.drop_index(op.f('ix_stat_history_benefits_benefit_name'), table_name='stat_history_benefits')
    op.drop_table('stat_history_benefits')
    # ### end Alembic commands ###
