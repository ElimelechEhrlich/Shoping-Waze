import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipt_router)
app.include_router(basket_router)
app.include_router(products_router)


@app.on_event("startup")
def on_startup() -> None:
    if settings.create_tables_on_startup:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables checked/created on startup.")
    logger.info("Application startup completed.")

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)