from fastapi import APIRouter, UploadFile, File

from app.schemas.document_ai import DocumentAnalysisResponse
from app.services.document_ai import analyze_document

router = APIRouter(prefix="/documents", tags=["Document AI"])


@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze(file: UploadFile = File(...)):
    """Upload a document (invoice, customs form) for OCR and field extraction."""
    content = await file.read()
    return await analyze_document(file.filename or "unknown", content)
