from supabase import create_client, Client
from app.config import get_settings


def get_supabase() -> Client:
    """Get a Supabase client using the service role key (for backend operations)."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase_anon() -> Client:
    """Get a Supabase client using the anon key (respects RLS policies)."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)
