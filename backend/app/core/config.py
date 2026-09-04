"""
Core configuration for the SIH26009 backend.
Loads environment variables and provides app-wide settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "MOIL Manganese Intelligence"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/moil_db"
    DATABASE_SYNC_URL: str = "postgresql://postgres:postgres@localhost:5432/moil_db"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ML Models
    MODEL_DIR: str = "ml/models"

    # Google Earth Engine
    GEE_SERVICE_ACCOUNT: str = ""
    GEE_KEY_FILE: str = ""
    GEE_API_KEY: str = ""

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
