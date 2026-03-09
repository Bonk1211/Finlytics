"""Automated Supply Chain & Smart Inventory Management powered by Gemini.

Provides:
- Inventory level analysis with auto-reorder suggestions
- Supplier rating and recommendation system
"""

import json
from app.schemas.supply_chain import (
    InventoryCheckRequest, InventoryCheckResponse, ReorderSuggestion,
    SupplierRecommendRequest, SupplierRecommendResponse, SupplierRecommendation,
)
from app.services.gemini_client import generate

INVENTORY_SYSTEM_INSTRUCTION = """You are an expert supply chain and inventory management analyst for ASEAN MSMEs.

You analyze inventory levels and provide smart reorder recommendations.

Given a list of inventory items with current quantities, reorder points, and average daily sales,
analyze which items need reordering and provide actionable suggestions.

Respond in JSON format:
{
  "items_below_reorder": 3,
  "overall_health": "attention_needed",
  "ai_summary": "Brief overview of inventory status and key actions needed",
  "reorder_suggestions": [
    {
      "product_name": "Product A",
      "current_quantity": 10,
      "reorder_point": 50,
      "suggested_order_quantity": 200,
      "urgency": "critical",
      "estimated_days_until_stockout": 2.5,
      "reason": "Current stock will last ~2.5 days at current sales rate"
    }
  ]
}

Rules:
- overall_health: "healthy" (all stock above reorder), "attention_needed" (some below), "critical" (multiple items near stockout)
- urgency: "critical" (<3 days stock), "high" (3-7 days), "medium" (7-14 days), "low" (>14 days but below reorder)
- suggested_order_quantity should consider lead times and cover at least 30 days of demand
- estimated_days_until_stockout: calculate from current_quantity / average_daily_sales
- Include ALL items that are at or below their reorder point
- Sort suggestions by urgency (critical first)
"""

SUPPLIER_SYSTEM_INSTRUCTION = """You are an expert supplier evaluation and recommendation analyst for ASEAN MSMEs.

You evaluate suppliers based on reliability, cost, lead time, and regional advantages.
You also recommend strategies for building a resilient supplier network.

Given existing supplier profiles and product requirements, provide recommendations.

Respond in JSON format:
{
  "recommendations": [
    {
      "supplier_name": "Supplier Name",
      "score": 0.85,
      "strengths": ["Low cost", "Fast delivery"],
      "weaknesses": ["Limited capacity"],
      "recommendation": "Best for regular orders under 500 units"
    }
  ],
  "ai_summary": "Overall assessment and strategic advice for supplier management"
}

Rules:
- score: 0.0 to 1.0 overall rating
- Evaluate based on: reliability, cost efficiency, lead time, regional proximity, capacity
- If no existing suppliers provided, suggest what type of suppliers to look for
- Consider ASEAN regional trade advantages (proximity, ATIGA preferential tariffs)
- Provide strategic advice on supplier diversification
"""


async def check_inventory(request: InventoryCheckRequest) -> InventoryCheckResponse:
    """Analyze inventory levels and generate reorder suggestions using Gemini."""
    inventory_text = "\n".join(
        f"- {item.product_name} (SKU: {item.sku or 'N/A'}): "
        f"{item.current_quantity} {item.unit} in stock, "
        f"reorder point = {item.reorder_point}, "
        f"unit cost = USD {item.unit_cost:.2f}, "
        f"supplier = {item.supplier_name or 'Unknown'}, "
        f"category = {item.category or 'General'}"
        for item in request.inventory
    )

    daily_sales_text = "\n".join(
        f"- {product}: {sales:.1f} units/day"
        for product, sales in request.average_daily_sales.items()
    ) if request.average_daily_sales else "No daily sales data provided."

    prompt = f"""## Business: {request.business_name}

## Current Inventory ({len(request.inventory)} items)
{inventory_text}

## Average Daily Sales
{daily_sales_text}

Analyze inventory health and provide reorder recommendations.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=INVENTORY_SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        suggestions = [
            ReorderSuggestion(
                product_name=s["product_name"],
                current_quantity=float(s["current_quantity"]),
                reorder_point=float(s["reorder_point"]),
                suggested_order_quantity=float(s["suggested_order_quantity"]),
                urgency=s.get("urgency", "medium"),
                estimated_days_until_stockout=float(s.get("estimated_days_until_stockout", 0)),
                reason=s.get("reason", ""),
            )
            for s in parsed.get("reorder_suggestions", [])
        ]

        overall_health = parsed.get("overall_health", "healthy")
        if overall_health not in ("healthy", "attention_needed", "critical"):
            overall_health = "attention_needed"

        return InventoryCheckResponse(
            business_name=request.business_name,
            total_items=len(request.inventory),
            items_below_reorder=int(parsed.get("items_below_reorder", len(suggestions))),
            reorder_suggestions=suggestions,
            overall_health=overall_health,
            ai_summary=parsed.get("ai_summary", ""),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return InventoryCheckResponse(
            business_name=request.business_name,
            total_items=len(request.inventory),
            items_below_reorder=0,
            reorder_suggestions=[],
            overall_health="healthy",
            ai_summary=raw_response,
        )


async def recommend_suppliers(request: SupplierRecommendRequest) -> SupplierRecommendResponse:
    """Get AI-powered supplier recommendations using Gemini."""
    existing_text = ""
    if request.existing_suppliers:
        existing_text = "## Existing Suppliers\n" + "\n".join(
            f"- {s.name}: region={s.region}, lead_time={s.lead_time_days}d, "
            f"cost=USD {s.unit_cost:.2f}, reliability={s.reliability_score:.0%}, "
            f"min_order={s.minimum_order}, products={', '.join(s.products)}"
            for s in request.existing_suppliers
        )
    else:
        existing_text = "## Existing Suppliers\nNo existing suppliers provided."

    prompt = f"""## Product Needed: {request.product_name}
## Required Quantity: {request.required_quantity}
## Target Region: {request.target_region or 'ASEAN'}
## Max Lead Time: {request.max_lead_time_days} days

{existing_text}

Evaluate existing suppliers and recommend the best options.
If no suppliers exist, suggest what to look for.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=SUPPLIER_SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        recommendations = [
            SupplierRecommendation(
                supplier_name=r["supplier_name"],
                score=max(0.0, min(1.0, float(r.get("score", 0.5)))),
                strengths=r.get("strengths", []),
                weaknesses=r.get("weaknesses", []),
                recommendation=r.get("recommendation", ""),
            )
            for r in parsed.get("recommendations", [])
        ]

        return SupplierRecommendResponse(
            product_name=request.product_name,
            recommendations=recommendations,
            ai_summary=parsed.get("ai_summary", ""),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        return SupplierRecommendResponse(
            product_name=request.product_name,
            recommendations=[],
            ai_summary=raw_response,
        )
