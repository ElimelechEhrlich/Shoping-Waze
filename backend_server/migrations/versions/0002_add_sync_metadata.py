"""Add canonical_name and source columns to products table.

Revision ID: 0002_add_sync_metadata
Revises: 0001_initial_schema
Create Date: 2026-03-25
"""

import sqlalchemy as sa
from alembic import op

revision = "0002_add_sync_metadata"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("canonical_name", sa.String(255), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("source", sa.String(20), nullable=False, server_default="receipt"),
    )
    op.create_index("ix_products_canonical_name", "products", ["canonical_name"])

    # Backfill canonical_name for existing products using a basic normalization.
    # Full regex normalization runs in Python; here we apply LOWER + TRIM as a
    # good-enough baseline so existing rows are immediately matchable.
    op.execute(
        "UPDATE products SET canonical_name = LOWER(TRIM(name)) WHERE canonical_name IS NULL"
    )


def downgrade() -> None:
    op.drop_index("ix_products_canonical_name", table_name="products")
    op.drop_column("products", "source")
    op.drop_column("products", "canonical_name")
