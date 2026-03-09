"""Multilingual Translation Service.

Currently returns mock translations. Swap in NLLB / mBART for production.
"""

from app.schemas.translation import TranslateRequest, TranslateResponse, SupportedLanguage

# --- Mock translation dictionary ---
MOCK_TRANSLATIONS: dict[str, dict[SupportedLanguage, str]] = {
    "hello": {
        SupportedLanguage.ENGLISH: "Hello",
        SupportedLanguage.MALAY: "Helo",
        SupportedLanguage.INDONESIAN: "Halo",
        SupportedLanguage.THAI: "สวัสดี",
        SupportedLanguage.VIETNAMESE: "Xin chào",
        SupportedLanguage.CHINESE: "你好",
    },
}

LANGUAGE_NAMES = {
    SupportedLanguage.ENGLISH: "English",
    SupportedLanguage.MALAY: "Malay",
    SupportedLanguage.INDONESIAN: "Indonesian",
    SupportedLanguage.THAI: "Thai",
    SupportedLanguage.VIETNAMESE: "Vietnamese",
    SupportedLanguage.CHINESE: "Chinese",
}


def _detect_language(text: str) -> SupportedLanguage:
    """Simple heuristic language detection — replace with real detector."""
    if any("\u0e00" <= c <= "\u0e7f" for c in text):
        return SupportedLanguage.THAI
    if any("\u4e00" <= c <= "\u9fff" for c in text):
        return SupportedLanguage.CHINESE
    if any(c in "àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệ" for c in text.lower()):
        return SupportedLanguage.VIETNAMESE
    return SupportedLanguage.ENGLISH


async def translate_text(request: TranslateRequest) -> TranslateResponse:
    """Translate text between ASEAN languages (mock implementation)."""
    source_lang = request.source_language or _detect_language(request.text)
    target_lang = request.target_language

    # Mock: wrap the original text with a label
    translated = (
        f"[{LANGUAGE_NAMES[target_lang]} translation of: \"{request.text}\"] "
        f"— This is a mock translation. Connect NLLB/mBART model for real translations."
    )

    return TranslateResponse(
        translated_text=translated,
        source_language=source_lang,
        target_language=target_lang,
        confidence=0.85,
    )
