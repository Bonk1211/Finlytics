from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    app_env: str = "development"
    secret_key: str = "changeme"
    allowed_origins: str = "http://localhost:3000"

    # --- Google Gemini ---
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"

    # --- Mem0 ---
    mem0_api_key: str | None = None

    # --- Feature flags ---
    enable_trade_ai: bool = True
    enable_document_ai: bool = True
    enable_translation: bool = True
    enable_inventory: bool = True
    enable_credit: bool = True
    enable_market: bool = True

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
