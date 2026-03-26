import pytest

from app.core.utils import normalize_product_name


@pytest.mark.parametrize(
    "raw, expected",
    [
        # Basic normalization
        ("חלב תנובה", "חלב תנובה"),
        ("  חלב תנובה  ", "חלב תנובה"),
        # Hyphens become spaces
        ("חלב-תנובה", "חלב תנובה"),
        # Multiple spaces collapse
        ("חלב  תנובה  3%", "חלב תנובה 3"),
        # Percent sign removed
        ("יוגורט 3%", "יוגורט 3"),
        # Mixed separators
        ("חלב_תנובה-3%", "חלב תנובה 3"),
        # Dots and commas removed (comma → space, then collapsed)
        ("גבינה לבנה, 5%", "גבינה לבנה 5"),
        # Uppercase to lowercase
        ("MILK", "milk"),
        # Unicode NFC normalization (Hebrew should pass through unchanged)
        ("ביסלי בצל", "ביסלי בצל"),
        # Empty / whitespace
        ("", ""),
        ("   ", ""),
        # The core fix: onion-flavored snack ≠ onion
        # Both normalize correctly but to different strings
        ("ביסלי בצל", "ביסלי בצל"),
        ("בצל סגול", "בצל סגול"),
        # Chain formatting variation — both produce same canonical
        ("חלב תנובה 3%", "חלב תנובה 3"),
        ("חלב-תנובה  3%", "חלב תנובה 3"),
    ],
)
def test_normalize_product_name(raw: str, expected: str) -> None:
    assert normalize_product_name(raw) == expected


def test_normalize_handles_none_like_empty() -> None:
    assert normalize_product_name("") == ""


def test_normalize_idempotent() -> None:
    """Calling normalize twice should give the same result."""
    name = "חלב-תנובה 3%"
    once = normalize_product_name(name)
    twice = normalize_product_name(once)
    assert once == twice
