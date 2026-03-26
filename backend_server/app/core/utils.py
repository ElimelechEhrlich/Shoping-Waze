import re
import unicodedata


def normalize_product_name(name: str) -> str:
    """
    Normalize a Hebrew product name for consistent matching across supermarket chains.

    Handles Hebrew unicode normalization, special-character removal,
    and whitespace collapsing so that minor formatting differences
    between chains do not create duplicate products.

    Examples:
        "חלב תנובה 3%"  -> "חלב תנובה 3"
        "חלב-תנובה  3%" -> "חלב תנובה 3"
        "יוגורט-תות"    -> "יוגורט תות"
    """
    if not name:
        return ""
    name = name.strip().lower()
    name = unicodedata.normalize("NFC", name)
    name = re.sub(r"""["'\-_.,/\\|%+]""", " ", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name
