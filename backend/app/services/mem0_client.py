"""Mem0 memory integration for the MSME Trade AI Platform."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.config import get_settings

try:
    from mem0 import MemoryClient
except ImportError:
    MemoryClient = None

_memory_client = None
_mem_executor = ThreadPoolExecutor(max_workers=5)

def get_memory_client():
    """Get the Mem0 MemoryClient instance."""
    global _memory_client
    if _memory_client is None and MemoryClient is not None:
        settings = get_settings()
        if settings.mem0_api_key:
            _memory_client = MemoryClient(api_key=settings.mem0_api_key)
    return _memory_client


def _sync_add_memory(messages: list[dict], user_id: str):
    client = get_memory_client()
    if client is not None:
        client.add(messages, user_id=user_id)


def _sync_get_memories(user_id: str, query: str = "") -> str:
    client = get_memory_client()
    if client is not None:
        if query:
            results = client.search(query, user_id=user_id)
        else:
            results = client.get_all(user_id=user_id)
        
        # Format the memory into strings
        if results and isinstance(results, list):
            # Mem0 returning list of memories
            memories = [str(r.get('memory', r)) for r in results]
            return "\n".join(f"- {mem}" for mem in memories)
    return ""


async def add_memory_async(messages: list[dict], user_id: str):
    """Add memory asynchronously using the threadpool."""
    if get_memory_client() is None:
        return
        
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(_mem_executor, _sync_add_memory, messages, user_id)


async def get_memories_async(user_id: str, query: str = "") -> str:
    """Retrieve memories asynchronously to be used as context."""
    if get_memory_client() is None:
        return ""

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_mem_executor, _sync_get_memories, user_id, query)
