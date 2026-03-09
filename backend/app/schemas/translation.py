from pydantic import BaseModel, Field
from enum import Enum


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    MALAY = "ms"
    INDONESIAN = "id"
    THAI = "th"
    VIETNAMESE = "vi"
    CHINESE = "zh"


class TranslateRequest(BaseModel):
    """Request to translate text."""
    text: str = Field(..., min_length=1, description="Text to translate")
    source_language: SupportedLanguage | None = Field(None, description="Source language (auto-detect if null)")
    target_language: SupportedLanguage = Field(..., description="Target language")


class TranslateResponse(BaseModel):
    """Response from translation."""
    translated_text: str
    source_language: SupportedLanguage
    target_language: SupportedLanguage
    confidence: float = Field(ge=0, le=1)
