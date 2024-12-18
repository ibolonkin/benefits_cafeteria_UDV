"""New logic 2

Revision ID: b7570a11dbdc
Revises: 38216b66f19a
Create Date: 2024-11-19 14:19:14.557056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7570a11dbdc'
down_revision: Union[str, None] = '38216b66f19a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('application', sa.Column('benefit_uuid', sa.UUID(), nullable=False))
    op.drop_index('ix_application_benefits_uuid', table_name='application')
    op.drop_constraint('ub_user_benefit', 'application', type_='unique')
    op.create_index(op.f('ix_application_benefit_uuid'), 'application', ['benefit_uuid'], unique=False)
    op.create_unique_constraint('uc_user_benefit', 'application', ['user_uuid', 'benefit_uuid'])
    op.drop_constraint('application_benefits_uuid_fkey', 'application', type_='foreignkey')
    op.create_foreign_key(None, 'application', 'benefits', ['benefit_uuid'], ['uuid'])
    op.drop_column('application', 'benefits_uuid')
    op.add_column('approved_benefits', sa.Column('benefit_uuid', sa.UUID(), nullable=False))
    op.drop_index('ix_approved_benefits_benefits_uuid', table_name='approved_benefits')
    op.create_index(op.f('ix_approved_benefits_benefit_uuid'), 'approved_benefits', ['benefit_uuid'], unique=False)
    op.drop_constraint('approved_benefits_benefits_uuid_fkey', 'approved_benefits', type_='foreignkey')
    op.create_foreign_key(None, 'approved_benefits', 'benefits', ['benefit_uuid'], ['uuid'])
    op.drop_column('approved_benefits', 'benefits_uuid')
    op.drop_index('ix_benefits_uuid', table_name='benefits')
    op.create_index(op.f('ix_benefits_uuid'), 'benefits', ['uuid'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_benefits_uuid'), table_name='benefits')
    op.create_index('ix_benefits_uuid', 'benefits', ['uuid'], unique=True)
    op.add_column('approved_benefits', sa.Column('benefits_uuid', sa.UUID(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'approved_benefits', type_='foreignkey')
    op.create_foreign_key('approved_benefits_benefits_uuid_fkey', 'approved_benefits', 'benefits', ['benefits_uuid'], ['uuid'])
    op.drop_index(op.f('ix_approved_benefits_benefit_uuid'), table_name='approved_benefits')
    op.create_index('ix_approved_benefits_benefits_uuid', 'approved_benefits', ['benefits_uuid'], unique=False)
    op.drop_column('approved_benefits', 'benefit_uuid')
    op.add_column('application', sa.Column('benefits_uuid', sa.UUID(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'application', type_='foreignkey')
    op.create_foreign_key('application_benefits_uuid_fkey', 'application', 'benefits', ['benefits_uuid'], ['uuid'])
    op.drop_constraint('uc_user_benefit', 'application', type_='unique')
    op.drop_index(op.f('ix_application_benefit_uuid'), table_name='application')
    op.create_unique_constraint('ub_user_benefit', 'application', ['user_uuid', 'benefits_uuid'])
    op.create_index('ix_application_benefits_uuid', 'application', ['benefits_uuid'], unique=False)
    op.drop_column('application', 'benefit_uuid')
    # ### end Alembic commands ###
