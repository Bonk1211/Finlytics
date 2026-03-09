"""Multilingual Translation Service powered by Gemini.

Uses Gemini for high-quality ASEAN language translation.
"""

import json
from app.schemas.translation import TranslateRequest, TranslateResponse, SupportedLanguage
from app.services.gemini_client import generate

LANGUAGE_NAMES = {
    SupportedLanguage.ENGLISH: "English",
    SupportedLanguage.MALAY: "Malay (Bahasa Melayu)",
    SupportedLanguage.INDONESIAN: "Indonesian (Bahasa Indonesia)",
    SupportedLanguage.THAI: "Thai",
    SupportedLanguage.VIETNAMESE: "Vietnamese",
    SupportedLanguage.CHINESE: "Chinese (Simplified)",
}

SYSTEM_INSTRUCTION = """You are a professional translator specializing in ASEAN business and trade languages.

Translate the given text accurately and naturally. Preserve the original meaning, tone, and any technical or business terminology.

For trade-related terms, use locally accepted terminology in the target language.

Respond in JSON format:
{
  "translated_text": "The translated text here",
  "detected_source_language": "en",
  "confidence": 0.95
}

Language codes: en (English), ms (Malay), id (Indonesian), th (Thai), vi (Vietnamese), zh (Chinese Simplified).
"""


async def translate_text(request: TranslateRequest) -> TranslateResponse:
    """Translate text between ASEAN languages using Gemini."""
    source_lang_name = LANGUAGE_NAMES.get(request.source_language, "auto-detect")
    target_lang_name = LANGUAGE_NAMES[request.target_language]

    if request.source_language:
        prompt = (
            f"Translate the following text from {source_lang_name} to {target_lang_name}.\n\n"
            f"Text to translate:\n{request.text}"
        )
    else:
        prompt = (
            f"Detect the language and translate the following text to {target_lang_name}.\n\n"
            f"Text to translate:\n{request.text}"
        )

    prompt += "\n\nRespond in the JSON format specified."

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        translated_text = parsed.get("translated_text", raw_response)
        confidence = float(parsed.get("confidence", 0.8))

        detected_lang_code = parsed.get("detected_source_language", "en")
        try:
            source_lang = request.source_language or SupportedLanguage(detected_lang_code)
        except ValueError:
            source_lang = SupportedLanguage.ENGLISH

    except (json.JSONDecodeError, ValueError):
        translated_text = raw_response
        confidence = 0.7
        source_lang = request.source_language or SupportedLanguage.ENGLISH

    return TranslateResponse(
        translated_text=translated_text,
        source_language=source_lang,
        target_language=request.target_language,
        confidence=round(min(max(confidence, 0), 1), 2),
    )
