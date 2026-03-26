import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

@dataclass(frozen=True)
class Settings:
    app_name: str = "Grocery Basket Compare API"
    app_version: str = "1.0.0"
    database_url: str = os.getenv(
        "SQLALCHEMY_DATABASE_URL",
        "mysql+pymysql://root:root@localhost:3306/grocery_app",
    )
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model_name: str = os.getenv("GEMINI_MODEL_NAME", "gemini-3-flash-preview")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file_path: Path = Path(os.getenv("LOG_FILE_PATH", "logs/app.log"))
    create_tables_on_startup: bool = os.getenv("CREATE_TABLES_ON_STARTUP", "true").lower() == "true"
    
    # התיקון כאן: משתמשים ב-field עם default_factory שמריץ פונקציה אנונימית (lambda)
    cors_allow_origins: list[str] = field(
        default_factory=lambda: [
            origin.strip().rstrip("/")
            for origin in os.getenv(
                "CORS_ALLOW_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://my-waze.onrender.com",
            ).split(",")
            if origin.strip()
        ]
    )
    cors_allow_origin_regex: str | None = os.getenv(
        "CORS_ALLOW_ORIGIN_REGEX",
        r"^https://.*\.onrender\.com$",
    )

settings = Settings()


