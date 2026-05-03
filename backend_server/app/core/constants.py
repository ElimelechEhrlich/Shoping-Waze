MAX_IMAGE_SIZE_MB = 5
MIN_IMAGE_SIZE_BYTES = 1024  # 1 KB — anything smaller is obviously not a real receipt
ALLOWED_IMAGE_MIME_TYPES: frozenset[str] = frozenset(
    {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"}
)
DEFAULT_MISSING_PRICE = 0
MISSING_PRICE_PENALTY_RATE = 0.15
LOG_FILE_MAX_BYTES = 5 * 1024 * 1024
LOG_FILE_BACKUP_COUNT = 5

