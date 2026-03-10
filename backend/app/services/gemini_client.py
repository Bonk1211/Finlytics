"""Shared Google Gemini client for all AI services.

Architecture:
- Separate thread pools per workload type (generation, agent, file, embedding)
  so long-running agent calls don't starve quick translations.
- Global concurrency semaphore prevents Gemini API quota exhaustion.
- Per-call timeout prevents hung threads from permanently consuming a pool slot.
"""

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from google import genai
from google.genai import errors
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

# ── Per-workload thread pools ──
# Separated so long-running agent calls don't starve quick tasks.
_generation_executor = ThreadPoolExecutor(max_workers=12, thread_name_prefix="gemini-gen")
_agent_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="gemini-agent")
_file_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="gemini-file")
_embedding_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="gemini-embed")

# ── Global concurrency cap ──
# Limits total in-flight Gemini API calls across all pools to prevent quota exhaustion.
# Gemini free tier: 15 RPM; paid tier: much higher. Set conservatively.
_api_semaphore = asyncio.Semaphore(15)

# ── Default timeout per call (seconds) ──
_DEFAULT_TIMEOUT = 60
_AGENT_TIMEOUT = 120  # Agent calls are multi-step, need more time


def get_gemini_client() -> genai.Client:
    """Get or create the shared Gemini client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ── Text generation ──

@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(errors.ServerError),
    reraise=True,
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
    """Generate text using the generation pool with timeout and rate limiting."""
    async with _api_semaphore:
        loop = asyncio.get_running_loop()
        return await asyncio.wait_for(
            loop.run_in_executor(_generation_executor, _sync_generate, prompt, system_instruction),
            timeout=_DEFAULT_TIMEOUT,
        )


async def generate_for_agent(prompt: str, system_instruction: str = "") -> str:
    """Generate text using the dedicated agent pool (longer timeout)."""
    async with _api_semaphore:
        loop = asyncio.get_running_loop()
        return await asyncio.wait_for(
            loop.run_in_executor(_agent_executor, _sync_generate, prompt, system_instruction),
            timeout=_AGENT_TIMEOUT,
        )


# ── Agentic generation (2-pass: draft + reflection) ──

async def agentic_generate(prompt: str, system_instruction: str = "") -> str:
    """Agentic generation with self-reflection to prevent hallucinations."""
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
    improved_response = await generate(reflection_prompt, "You are a self-reflecting, strictly factual AI.")
    return improved_response


# ── File analysis ──

@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(errors.ServerError),
    reraise=True,
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
    """Generate text from a file using the dedicated file pool."""
    async with _api_semaphore:
        loop = asyncio.get_running_loop()
        return await asyncio.wait_for(
            loop.run_in_executor(_file_executor, _sync_generate_file, file_bytes, mime_type, prompt, system_instruction),
            timeout=_DEFAULT_TIMEOUT,
        )


# ── Embedding generation ──

def _sync_generate_embedding(text: str) -> list[float]:
    """Generate embedding vector using Gemini."""
    client = get_gemini_client()
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return list(response.embeddings[0].values)


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding using the dedicated embedding pool."""
    async with _api_semaphore:
        loop = asyncio.get_running_loop()
        return await asyncio.wait_for(
            loop.run_in_executor(_embedding_executor, _sync_generate_embedding, text),
            timeout=_DEFAULT_TIMEOUT,
        )
