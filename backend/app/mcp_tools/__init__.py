"""MCP Tools package — organises FastMCP tool definitions by domain.

Imports all tool-registration modules so that importing this package
automatically registers every @mcp.tool() with the shared `mcp` instance.

Exports:
    mcp      – the FastMCP server instance
    mcp_app  – the ASGI/HTTP app for mounting into FastAPI
"""

import sys
from pathlib import Path

# Ensure `app.*` imports resolve when run standalone via `fastmcp run`
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from fastmcp import FastMCP

mcp = FastMCP("MSME_Trade_AI_MCP")

# Import every tool module so their @mcp.tool() decorators execute
from app.mcp_tools import trade, credit, market, supply_chain, translation, inventory, dashboard, utils  # noqa: E402,F401

mcp_app = mcp.http_app(path="/")
