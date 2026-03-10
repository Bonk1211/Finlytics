"""Utility tools."""

from typing import Annotated

from app.mcp_tools import mcp


@mcp.tool()
def evaluate_math(expression: Annotated[str, "A valid Python math expression, e.g. '2 + 3 * 4'"]) -> str:
    """Evaluate a mathematical expression safely.

    Call this for quick calculations during trade, pricing, or financial analysis.
    """
    try:
        allowed_names = {"__builtins__": None}
        return str(eval(expression, allowed_names, {}))
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
def get_trade_regions() -> str:
    """Get the list of supported ASEAN trade regions.

    Call this to check which countries/regions are supported by the platform.
    """
    return "Supported regions: Singapore, Malaysia, Indonesia, Thailand, Vietnam, Philippines, Myanmar, Cambodia, Laos, Brunei"
