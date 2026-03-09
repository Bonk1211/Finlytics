from pydantic import BaseModel, Field


class ExtractedField(BaseModel):
    """A single field extracted from a document."""
    field_name: str
    value: str
    confidence: float = Field(ge=0, le=1)


class DocumentAnalysisResponse(BaseModel):
    """Response from document analysis."""
    filename: str
    extracted_fields: list[ExtractedField] = []
    raw_text: str = ""
    document_type: str = "unknown"
