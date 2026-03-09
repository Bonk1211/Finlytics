from fastapi import APIRouter

from app.schemas.inventory import PredictRequest, PredictResponse
from app.services.inventory import predict_demand

router = APIRouter(prefix="/inventory", tags=["Inventory Prediction"])


@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """Predict future inventory demand based on sales history."""
    return await predict_demand(request)
