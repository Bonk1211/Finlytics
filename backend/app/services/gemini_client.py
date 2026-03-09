"""Shared Google Gemini client for all AI services."""

from google import genai

from app.config import get_settings

_client: genai.Client | None = None


def get_gemini_client() -> genai.Client:
    """Get or create the shared Gemini client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def generate(prompt: str, system_instruction: str = "") -> str:
    """Generate text using Gemini. Shared helper for all services."""
    settings = get_settings()
    client = get_gemini_client()

    config = None
    if system_instruction:
        config = genai.types.GenerateContentConfig(
            system_instruction=system_instruction,
        )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=config,
    )
    return response.text or ""


async def generate_with_file(file_bytes: bytes, mime_type: str, prompt: str, system_instruction: str = "") -> str:
    """Generate text from a file (image/PDF) + prompt using Gemini."""
    settings = get_settings()
    client = get_gemini_client()

    # Upload the file inline as Part
    file_part = genai.types.Part.from_bytes(data=file_bytes, mime_type=mime_type)

    config = None
    if system_instruction:
        config = genai.types.GenerateContentConfig(
            system_instruction=system_instruction,
        )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=[file_part, prompt],
        config=config,
    )
    return response.text or ""
