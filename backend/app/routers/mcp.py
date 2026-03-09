"""Model Context Protocol (MCP) FastAPI Server integration."""

from fastapi import APIRouter
from mcp.server.fastmcp import FastMCP

router = APIRouter(prefix="/mcp", tags=["Model Context Protocol"])

# Create an MCP server to expose our AI tools to external clients
mcp = FastMCP("MSME_Trade_AI_MCP")

@mcp.tool()
def evaluate_math(expression: str) -> str:
    """Evaluate a mathematical expression.
    
    Args:
        expression: A valid Python math expression as a string
    """
    try:
        allowed_names = {"__builtins__": None}
        return str(eval(expression, allowed_names, {}))
    except Exception as e:
        return f"Error: {e}"

@mcp.tool()
def get_trade_regions() -> str:
    """Get supported ASEAN trade regions."""
    return "Supported regions: Singapore, Malaysia, Indonesia, Thailand, Vietnam, Philippines"

# Map the MCP server onto the FastAPI router using SSE
router.mount("/", mcp.sse_app())
