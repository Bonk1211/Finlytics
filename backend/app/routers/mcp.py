"""Model Context Protocol (MCP) FastAPI router.

Thin wrapper that mounts the MCP HTTP app (defined in app.mcp_tools)
onto a FastAPI router for embedding inside the main API.
"""

from fastapi import APIRouter
from app.mcp_tools import mcp, mcp_app  # noqa: F401 – re-exported for main.py

router = APIRouter(prefix="/mcp", tags=["Model Context Protocol"])
router.mount("/", mcp_app)
