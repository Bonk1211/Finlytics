from fastapi import APIRouter

from app.schemas.trade_ai import (
    QueryRequest, QueryResponse,
    ComplianceDocRequest, ComplianceDocResponse,
    TariffLookupRequest, TariffLookupResponse,
    HSCodeSuggestRequest, HSCodeSuggestResponse,
)
from app.services.trade_ai import (
    query_trade_regulations, generate_compliance_document, lookup_tariff,
    suggest_hs_codes,
)

router = APIRouter(prefix="/trade-ai", tags=["Trade Regulation AI"])


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Ask a trade regulation question. Uses RAG to find relevant regulations."""
    return await query_trade_regulations(request)


@router.post("/generate-document", response_model=ComplianceDocResponse)
async def generate_document(request: ComplianceDocRequest):
    """Generate trade compliance documents (Commercial Invoice, Certificate of Origin, etc.)."""
    return await generate_compliance_document(request)


@router.post("/tariff-lookup", response_model=TariffLookupResponse)
async def tariff_lookup(request: TariffLookupRequest):
    """Look up tariff rates, estimated HS codes, and export/import requirements."""
    return await lookup_tariff(request)


@router.post("/suggest-hs-codes", response_model=HSCodeSuggestResponse)
async def suggest_hs(request: HSCodeSuggestRequest):
    """Suggest HS codes from a plain-language product description using semantic search."""
    return await suggest_hs_codes(request)
