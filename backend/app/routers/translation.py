from fastapi import APIRouter

from app.schemas.translation import TranslateRequest, TranslateResponse
from app.services.translation import translate_text

router = APIRouter(prefix="/translate", tags=["Translation"])


@router.post("", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    """Translate text between ASEAN languages."""
    return await translate_text(request)
