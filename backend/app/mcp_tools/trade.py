"""Trade regulation AI tools."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.services.trade_ai import (
    query_trade_regulations as _query_trade_regulations,
    suggest_hs_codes as _suggest_hs_codes,
    lookup_tariff as _lookup_tariff,
    generate_compliance_document as _generate_compliance_document,
)
from app.schemas.trade_ai import (
    QueryRequest,
    ComplianceDocRequest,
    TariffLookupRequest,
    HSCodeSuggestRequest,
)


@mcp.tool()
async def query_trade_regulations(
    question: Annotated[str, "Trade regulation question to ask"],
    context: Annotated[str, "Optional additional context"] = "",
    user_id: Annotated[str, "User ID for contextual memory"] = "default_msme",
) -> str:
    """Ask any question about ASEAN trade regulations, customs procedures, tariffs, or export/import requirements.

    Uses RAG with trade regulation knowledge base to provide sourced answers.
    Call this when the user asks about trade rules, customs, import/export procedures, or ASEAN trade agreements.
    """
    try:
        result = await _query_trade_regulations(
            QueryRequest(question=question, context=context or None, user_id=user_id)
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def suggest_hs_codes(
    query: Annotated[str, "Product description in everyday language, e.g. 'dried coffee beans' or 'cotton t-shirts'"],
) -> str:
    """Find the correct HS (Harmonized System) tariff classification codes for a product.

    Accepts a plain-language product description and returns up to 3 AI-ranked suggestions
    with confidence scores and explanations. Call this when the user needs to classify a
    product for customs or wants to find an HS code.
    """
    try:
        result = await _suggest_hs_codes(HSCodeSuggestRequest(query=query))
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def lookup_tariff(
    product_name: Annotated[str, "Name of the product to look up"],
    source_country: Annotated[str, "Origin/exporting country, e.g. 'Malaysia'"],
    destination_country: Annotated[str, "Destination/importing country, e.g. 'Thailand'"],
    hs_code: Annotated[str, "HS code if known (optional)"] = "",
) -> str:
    """Look up applicable tariff rates, required documents, and import restrictions for a product.

    Call this when the user wants to know tariff rates, duties, required paperwork, or import
    restrictions for moving goods between two countries.
    """
    try:
        result = await _lookup_tariff(
            TariffLookupRequest(
                product_name=product_name,
                hs_code=hs_code,
                source_country=source_country,
                destination_country=destination_country,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
async def generate_compliance_document(
    document_type: Annotated[str, "Document type: 'Commercial Invoice', 'Certificate of Origin', 'Packing List', or 'Customs Declaration'"],
    source_country: Annotated[str, "Exporting country"] = "",
    destination_country: Annotated[str, "Importing country"] = "",
    buyer: Annotated[str, "Buyer/importer name and address"] = "",
    seller: Annotated[str, "Seller/exporter name and address"] = "",
    product: Annotated[str, "Product name and description"] = "",
    quantity: Annotated[str, "Quantity and unit, e.g. '500 kg'"] = "",
    value: Annotated[str, "Total value with currency, e.g. 'USD 5000'"] = "",
    hs_code: Annotated[str, "HS tariff code"] = "",
    incoterms: Annotated[str, "Incoterms, e.g. 'FOB', 'CIF'"] = "",
) -> str:
    """Generate a trade compliance document such as a Commercial Invoice, Certificate of Origin, or Packing List.

    Provide as many transaction details as possible for the best result.
    Call this when the user needs to create export/import paperwork.
    """
    try:
        details = {
            k: v for k, v in {
                "buyer": buyer, "seller": seller, "product": product,
                "quantity": quantity, "value": value, "hs_code": hs_code,
                "incoterms": incoterms,
            }.items() if v
        }
        result = await _generate_compliance_document(
            ComplianceDocRequest(
                document_type=document_type,
                transaction_details=details,
                source_country=source_country,
                destination_country=destination_country,
            )
        )
        return result.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})
