"""Add cascade delete to edge foreign keys

Revision ID: b1c2d3e4f5g6
Revises: a1b2c3d4e5f6
Create Date: 2026-03-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5g6'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 修改 source_node_id 外键，添加 ondelete="CASCADE"
    op.drop_constraint('edges_source_node_id_fkey', 'edges', type_='foreignkey')
    op.create_foreign_key('edges_source_node_id_fkey', 'edges', 'nodes', ['source_node_id'], ['id'], ondelete='CASCADE')
    
    # 修改 target_node_id 外键，添加 ondelete="CASCADE"
    op.drop_constraint('edges_target_node_id_fkey', 'edges', type_='foreignkey')
    op.create_foreign_key('edges_target_node_id_fkey', 'edges', 'nodes', ['target_node_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # 恢复到之前的状态
    op.drop_constraint('edges_source_node_id_fkey', 'edges', type_='foreignkey')
    op.create_foreign_key('edges_source_node_id_fkey', 'edges', 'nodes', ['source_node_id'], ['id'])
    
    op.drop_constraint('edges_target_node_id_fkey', 'edges', type_='foreignkey')
    op.create_foreign_key('edges_target_node_id_fkey', 'edges', 'nodes', ['target_node_id'], ['id'])
