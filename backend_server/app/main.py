import logging
import os
from contextlib import asynccontextmanager
from logging.handlers import RotatingFileHandler
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.basket_routes import router as basket_router
from app.api.products_routes import router as products_router
from app.api.receipt_routes import router as receipt_router
from app.core.config import settings
from app.core.constants import LOG_FILE_BACKUP_COUNT, LOG_FILE_MAX_BYTES
from app.database.base import Base
from app.database.session import engine
import app.models  # noqa: F401


def configure_logging() -> None:
    log_file_path: Path = settings.log_file_path
    log_file_path.parent.mkdir(parents=True, exist_ok=True)

    log_format = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    formatter = logging.Formatter(log_format)

    file_handler = RotatingFileHandler(
        filename=log_file_path,
        maxBytes=LOG_FILE_MAX_BYTES,
        backupCount=LOG_FILE_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level.upper())
    root_logger.handlers.clear()
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)


configure_logging()
logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    """Apply all pending Alembic migrations on startup.

    Handles two scenarios gracefully:
    1. Fresh DB — Alembic runs all migrations from scratch.
    2. DB created via create_all (no alembic_version table) — we stamp the
       initial revision so Alembic knows the base schema already exists, then
       upgrade to HEAD to apply only the new migrations (e.g. adding columns).

    Uses absolute paths so the app works regardless of the process CWD.
    """
    try:
        from alembic import command as alembic_command  # noqa: PLC0415
        from alembic.config import Config  # noqa: PLC0415

        backend_dir = Path(__file__).parents[1]  # …/backend_server/
        alembic_ini = backend_dir / "alembic.ini"

        alembic_cfg = Config(str(alembic_ini))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
        alembic_cfg.set_main_option("script_location", str(backend_dir / "migrations"))

        # If the DB was bootstrapped with create_all instead of Alembic, the
        # alembic_version table won't exist.  In that case we stamp the initial
        # revision (the tables are already there) so the subsequent upgrade only
        # applies the incremental migrations that are still missing.
        with engine.connect() as conn:
            version_table_exists = engine.dialect.has_table(conn, "alembic_version")

        if not version_table_exists:
            # Check whether the base tables already exist (create_all scenario).
            with engine.connect() as conn:
                products_table_exists = engine.dialect.has_table(conn, "products")

            if products_table_exists:
                logger.info(
                    "DB was created via create_all (no alembic_version table). "
                    "Stamping revision 0001_initial_schema before upgrading."
                )
                alembic_command.stamp(alembic_cfg, "0001_initial_schema")

        alembic_command.upgrade(alembic_cfg, "head")
        logger.info("Alembic migrations applied successfully.")
    except Exception:
        logger.exception(
            "Alembic migration failed — the app will start but some endpoints "
            "may not work correctly until the DB schema is updated."
        )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Run migrations first so every column defined in the SQLAlchemy models
    # actually exists in the DB before any request handler touches them.
    _run_migrations()

    # Fallback: create any tables that Alembic migrations don't cover yet
    # (e.g. a completely fresh DB without an alembic_version table).
    if settings.create_tables_on_startup:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables checked/created on startup.")

    logger.info("Application startup completed.")

    yield

    logger.info("Application shutdown completed.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_origin_regex=settings.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipt_router)
app.include_router(basket_router)
app.include_router(products_router)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
