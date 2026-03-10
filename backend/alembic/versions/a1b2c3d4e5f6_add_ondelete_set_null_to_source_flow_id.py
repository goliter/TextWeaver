"""Add ondelete SET NULL to source_flow_id

Revision ID: a1b2c3d4e5f6
Revises: 661a424cdc2a
Create Date: 2026-03-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '661a424cdc2a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 重新创建外键约束，添加 ondelete="SET NULL"
    op.drop_constraint('workflow_templates_source_flow_id_fkey', 'workflow_templates', type_='foreignkey')
    op.create_foreign_key('workflow_templates_source_flow_id_fkey', 'workflow_templates', 'flows', ['source_flow_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # 恢复到之前的状态
    op.drop_constraint('workflow_templates_source_flow_id_fkey', 'workflow_templates', type_='foreignkey')
    op.create_foreign_key('workflow_templates_source_flow_id_fkey', 'workflow_templates', 'flows', ['source_flow_id'], ['id'])
