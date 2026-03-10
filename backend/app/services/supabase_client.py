"""Shared Supabase client for all database operations.

Uses a cached singleton pattern (like gemini_client.py).
Gracefully returns None if Supabase is not configured, so services
can operate in "stateless mode" during development.
"""

import logging
from supabase import create_client, Client
from app.config import get_settings

logger = logging.getLogger(__name__)

_client: Client | None = None
_initialized = False


def get_supabase() -> Client | None:
    """Get the cached Supabase client (service role key).

    Returns None if Supabase credentials are not configured,
    allowing services to degrade gracefully.
    """
    global _client, _initialized
    if _initialized:
        return _client

    _initialized = True
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_key:
        logger.warning("Supabase not configured — running in stateless mode")
        return None

    try:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
        logger.info("Supabase client initialized")
    except Exception as e:
        logger.error("Failed to initialize Supabase client: %s", e)
        _client = None

    return _client
