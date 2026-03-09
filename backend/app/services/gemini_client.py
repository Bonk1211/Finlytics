"""Shared Google Gemini client for all AI services."""

import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from google import genai
from google.genai import errors
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

# ThreadPool for concurrent requests without blocking FastAPI event loop
_executor = ThreadPoolExecutor(max_workers=20)


def get_gemini_client() -> genai.Client:
    """Get or create the shared Gemini client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _should_retry_error(exc: Exception) -> bool:
    """Check if the error is a temporary server error 503 or 429."""
    if isinstance(exc, errors.ServerError):
        return exc.code in (503, 429, 500)
    return False


@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(errors.ServerError),
    reraise=True
)
def _sync_generate(prompt: str, system_instruction: str = "") -> str:
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


async def generate(prompt: str, system_instruction: str = "") -> str:
    """Generate text concurrently using a threadpool."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_executor, _sync_generate, prompt, system_instruction)


async def agentic_generate(prompt: str, system_instruction: str = "") -> str:
    """Agentic generation with self-reflection to prevent hallucinations and self-improve."""
    anti_hallucination_instruction = (
        system_instruction + "\n\nCRITICAL: DO NOT hallucinate. Only use provided data. "
        "If you do not know, state clearly that the information is unavailable."
    )
    
    # Pass 1: Initial generation
    initial_draft = await generate(prompt, anti_hallucination_instruction)
    
    # Pass 2: Reflection and Improvement
    reflection_prompt = f"""Review the following response for accuracy, helpfulness, and hallucinations based on the original prompt.
Original Prompt: {prompt}

Initial Draft: {initial_draft}

Rules:
1. If the draft contains hallucinations, remove them.
2. Ensure JSON format is strict if requested.
3. Improve clarity and structure (self-improvement).
4. Return ONLY the finalized response content, nothing else. Do not add 'Here is the improved response:'.
"""
    # The reflection uses the explicit threadpool as well
    improved_response = await generate(reflection_prompt, "You are a self-reflecting, strictly factual AI.")
    return improved_response


@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(errors.ServerError),
    reraise=True
)
def _sync_generate_file(file_bytes: bytes, mime_type: str, prompt: str, system_instruction: str = "") -> str:
    settings = get_settings()
    client = get_gemini_client()

    file_part = genai.types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
    config = genai.types.GenerateContentConfig(system_instruction=system_instruction) if system_instruction else None

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=[file_part, prompt],
        config=config,
    )
    return response.text or ""


async def generate_with_file(file_bytes: bytes, mime_type: str, prompt: str, system_instruction: str = "") -> str:
    """Generate text from a file concurrently using a threadpool."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_executor, _sync_generate_file, file_bytes, mime_type, prompt, system_instruction)
