from fastapi import APIRouter

from app.schemas.trade_ai import QueryRequest, QueryResponse
from app.services.trade_ai import query_trade_regulations

router = APIRouter(prefix="/trade-ai", tags=["Trade Regulation AI"])


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Ask a trade regulation question. Uses RAG to find relevant regulations."""
    return await query_trade_regulations(request)
