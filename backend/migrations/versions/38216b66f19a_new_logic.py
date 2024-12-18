"""New logic

Revision ID: 38216b66f19a
Revises: 3602ac9cd407
Create Date: 2024-11-19 14:11:23.689303

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '38216b66f19a'
down_revision: Union[str, None] = '3602ac9cd407'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('application',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_uuid', sa.UUID(), nullable=False),
    sa.Column('benefits_uuid', sa.UUID(), nullable=False),
    sa.Column('status', sa.String(), server_default='Pending', nullable=False),
    sa.Column('create_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('delete_at', sa.DateTime(), nullable=True),
    sa.CheckConstraint("status IN ('Approved', 'Denied', 'Pending')", name='check_status'),
    sa.ForeignKeyConstraint(['benefits_uuid'], ['benefits.uuid'], ),
    sa.ForeignKeyConstraint(['user_uuid'], ['users.uuid'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_uuid', 'benefits_uuid', name='ub_user_benefit')
    )
    op.create_index(op.f('ix_application_benefits_uuid'), 'application', ['benefits_uuid'], unique=False)
    op.create_index(op.f('ix_application_user_uuid'), 'application', ['user_uuid'], unique=False)
    op.create_table('approved_benefits',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_uuid', sa.UUID(), nullable=False),
    sa.Column('benefits_uuid', sa.UUID(), nullable=False),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('create_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('update_at', sa.Date(), server_default=sa.text('now()'), nullable=True),
    sa.Column('delete_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['benefits_uuid'], ['benefits.uuid'], ),
    sa.ForeignKeyConstraint(['user_uuid'], ['users.uuid'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_approved_benefits_benefits_uuid'), 'approved_benefits', ['benefits_uuid'], unique=False)
    op.create_index(op.f('ix_approved_benefits_user_uuid'), 'approved_benefits', ['user_uuid'], unique=False)
    op.drop_index('ix_user_benefits_benefits_uuid', table_name='user_benefits')
    op.drop_index('ix_user_benefits_user_uuid', table_name='user_benefits')
    op.drop_table('user_benefits')
    op.add_column('benefits', sa.Column('is_published', sa.Boolean(), server_default='False', nullable=False))
    op.add_column('category', sa.Column('is_published', sa.Boolean(), server_default='False', nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('category', 'is_published')
    op.drop_column('benefits', 'is_published')
    op.create_table('user_benefits',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('benefits_uuid', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(), server_default=sa.text("'Pending'::character varying"), autoincrement=False, nullable=False),
    sa.Column('create_at', sa.DATE(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('update_at', sa.DATE(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.Column('delete_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.CheckConstraint("status::text = ANY (ARRAY['Approved'::character varying, 'Denied'::character varying, 'Pending'::character varying]::text[])", name='check_status'),
    sa.ForeignKeyConstraint(['benefits_uuid'], ['benefits.uuid'], name='user_benefits_benefits_uuid_fkey'),
    sa.ForeignKeyConstraint(['user_uuid'], ['users.uuid'], name='user_benefits_user_uuid_fkey'),
    sa.PrimaryKeyConstraint('id', name='user_benefits_pkey'),
    sa.UniqueConstraint('user_uuid', 'benefits_uuid', name='uq_user_benefit')
    )
    op.create_index('ix_user_benefits_user_uuid', 'user_benefits', ['user_uuid'], unique=False)
    op.create_index('ix_user_benefits_benefits_uuid', 'user_benefits', ['benefits_uuid'], unique=False)
    op.drop_index(op.f('ix_approved_benefits_user_uuid'), table_name='approved_benefits')
    op.drop_index(op.f('ix_approved_benefits_benefits_uuid'), table_name='approved_benefits')
    op.drop_table('approved_benefits')
    op.drop_index(op.f('ix_application_user_uuid'), table_name='application')
    op.drop_index(op.f('ix_application_benefits_uuid'), table_name='application')
    op.drop_table('application')
    # ### end Alembic commands ###
