"""Initial schema for grocery basket compare.

Revision ID: 0001_initial_schema
Revises: None
Create Date: 2026-03-24
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_products_id", "products", ["id"])
    op.create_index("ix_products_name", "products", ["name"], unique=True)

    op.create_table(
        "stores",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_stores_id", "stores", ["id"])
    op.create_index("ix_stores_name", "stores", ["name"], unique=True)

    op.create_table(
        "price_history",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("store_id", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.Column("receipt_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"]),
    )
    op.create_index("ix_price_history_id", "price_history", ["id"])
    op.create_index("ix_price_history_product_id", "price_history", ["product_id"])
    op.create_index("ix_price_history_store_id", "price_history", ["store_id"])
    op.create_index("ix_price_history_receipt_date", "price_history", ["receipt_date"])
    op.create_index(
        "ix_price_history_store_product_receipt_date",
        "price_history",
        ["store_id", "product_id", "receipt_date"],
    )


def downgrade() -> None:
    op.drop_index("ix_price_history_store_product_receipt_date", table_name="price_history")
    op.drop_index("ix_price_history_receipt_date", table_name="price_history")
    op.drop_index("ix_price_history_store_id", table_name="price_history")
    op.drop_index("ix_price_history_product_id", table_name="price_history")
    op.drop_index("ix_price_history_id", table_name="price_history")
    op.drop_table("price_history")

    op.drop_index("ix_stores_name", table_name="stores")
    op.drop_index("ix_stores_id", table_name="stores")
    op.drop_table("stores")

    op.drop_index("ix_products_name", table_name="products")
    op.drop_index("ix_products_id", table_name="products")
    op.drop_table("products")

