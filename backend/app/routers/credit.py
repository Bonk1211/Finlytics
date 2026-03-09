from fastapi import APIRouter

from app.schemas.credit import CreditScoreRequest, CreditScoreResponse
from app.services.credit import score_credit

router = APIRouter(prefix="/credit", tags=["Credit Scoring"])


@router.post("/score", response_model=CreditScoreResponse)
async def score(request: CreditScoreRequest):
    """Evaluate MSME creditworthiness using alternative data."""
    return await score_credit(request)
