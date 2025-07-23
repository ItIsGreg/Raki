"""Add workspaces and workspace relationships

Revision ID: 9747dde4a66f
Revises: 160db4b9043d
Create Date: 2025-01-17 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9747dde4a66f'
down_revision: Union[str, Sequence[str], None] = '160db4b9043d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create workspaces table
    op.create_table('workspaces',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('storage_type', sa.String(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workspaces_id'), 'workspaces', ['id'], unique=False)
    op.create_index(op.f('ix_workspaces_user_id'), 'workspaces', ['user_id'], unique=False)

    # Add workspace_id to profiles table
    op.add_column('profiles', sa.Column('workspace_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_profiles_workspace_id'), 'profiles', ['workspace_id'], unique=False)
    
    # Add workspace_id to datasets table
    op.add_column('datasets', sa.Column('workspace_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_datasets_workspace_id'), 'datasets', ['workspace_id'], unique=False)
    
    # Add workspace_id to annotated_datasets table
    op.add_column('annotated_datasets', sa.Column('workspace_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_annotated_datasets_workspace_id'), 'annotated_datasets', ['workspace_id'], unique=False)

    # Create default workspace for existing users and data
    # This will be done in a separate data migration script for safety

    # Add foreign key constraints (after data migration)
    op.create_foreign_key('fk_profiles_workspace_id', 'profiles', 'workspaces', ['workspace_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_datasets_workspace_id', 'datasets', 'workspaces', ['workspace_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_annotated_datasets_workspace_id', 'annotated_datasets', 'workspaces', ['workspace_id'], ['id'], ondelete='CASCADE')

    # Make workspace_id NOT NULL after migration (will be done in follow-up migration)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove foreign key constraints
    op.drop_constraint('fk_annotated_datasets_workspace_id', 'annotated_datasets', type_='foreignkey')
    op.drop_constraint('fk_datasets_workspace_id', 'datasets', type_='foreignkey')
    op.drop_constraint('fk_profiles_workspace_id', 'profiles', type_='foreignkey')

    # Remove workspace_id columns
    op.drop_index(op.f('ix_annotated_datasets_workspace_id'), table_name='annotated_datasets')
    op.drop_column('annotated_datasets', 'workspace_id')
    
    op.drop_index(op.f('ix_datasets_workspace_id'), table_name='datasets')
    op.drop_column('datasets', 'workspace_id')
    
    op.drop_index(op.f('ix_profiles_workspace_id'), table_name='profiles')
    op.drop_column('profiles', 'workspace_id')

    # Drop workspaces table
    op.drop_index(op.f('ix_workspaces_user_id'), table_name='workspaces')
    op.drop_index(op.f('ix_workspaces_id'), table_name='workspaces')
    op.drop_table('workspaces') 