from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    app_env: str = "development"
    secret_key: str = "changeme"
    allowed_origins: str = "http://localhost:3000"

    # --- Google Gemini ---
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"

    # --- Supabase ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    # --- Mem0 ---
    mem0_api_key: str | None = None

    # --- Agent APIs ---
    tavily_api_key: str | None = None
    alphavantage_api_key: str | None = None
    news_api_key: str | None = None

    # --- Feature flags ---
    enable_trade_ai: bool = True
    enable_document_ai: bool = True
    enable_translation: bool = True
    enable_inventory: bool = True
    enable_credit: bool = True
    enable_market: bool = True

    _ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
    model_config = {"env_file": str(_ENV_FILE), "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
