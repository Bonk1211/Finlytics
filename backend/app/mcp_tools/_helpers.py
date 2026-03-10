"""Shared helpers used across MCP tool modules."""


def split_csv(s: str) -> list[str]:
    """Split comma-separated string into a list, stripping whitespace."""
    return [x.strip() for x in s.split(",") if x.strip()] if s else []
