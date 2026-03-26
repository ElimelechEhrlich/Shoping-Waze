from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from app.services.receipt_service import ReceiptService


def _make_service(session=None):
    return ReceiptService(db_session=session or MagicMock())


# ── _get_or_create_product ────────────────────────────────────────────────────

def test_get_or_create_product_finds_by_canonical_name() -> None:
    existing = MagicMock()
    existing.canonical_name = "חלב תנובה 3"

    session = MagicMock()
    session.scalar.return_value = existing

    service = _make_service(session)
    product = service._get_or_create_product("חלב-תנובה 3%")

    assert product is existing
    session.add.assert_not_called()


def test_get_or_create_product_falls_back_to_name() -> None:
    old_product = MagicMock()
    old_product.canonical_name = None

    session = MagicMock()
    # First scalar call (canonical_name) returns nothing; second (name) returns existing
    session.scalar.side_effect = [None, old_product]

    service = _make_service(session)
    product = service._get_or_create_product("חלב תנובה")

    assert product is old_product
    # canonical_name should be backfilled
    assert old_product.canonical_name is not None


def test_get_or_create_product_creates_new_when_not_found() -> None:
    session = MagicMock()
    session.scalar.return_value = None

    service = _make_service(session)
    service._get_or_create_product("מוצר חדש לגמרי")

    session.add.assert_called_once()
    session.flush.assert_called_once()
    added = session.add.call_args[0][0]
    assert added.source == "receipt"
    assert added.canonical_name is not None


def test_get_or_create_product_sets_source_receipt() -> None:
    session = MagicMock()
    session.scalar.return_value = None

    service = _make_service(session)
    service._get_or_create_product("מוצר חדש")

    added = session.add.call_args[0][0]
    assert added.source == "receipt"


# ── _normalize_name ───────────────────────────────────────────────────────────

def test_normalize_name_collapses_spaces() -> None:
    service = _make_service()
    assert service._normalize_name("חלב  תנובה") == "חלב תנובה"


def test_normalize_name_replaces_hyphens() -> None:
    service = _make_service()
    assert service._normalize_name("חלב-תנובה") == "חלב תנובה"
