from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    app_env: str = "development"
    secret_key: str = "changeme"
    allowed_origins: str = "http://localhost:3000"

    # --- LLM / RAG ---
    openai_api_key: str = ""
    embedding_model: str = "BAAI/bge-large-en"
    llm_model: str = "gpt-3.5-turbo"
    vector_store_path: str = "data/vector_store"

    # --- Document AI ---
    ocr_engine: str = "tesseract"  # tesseract | paddleocr

    # --- Translation ---
    translation_backend: str = "mock"  # mock | nllb | libretranslate

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
