from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request to ask a trade regulation question."""
    question: str = Field(..., min_length=1, description="The trade regulation question to ask")
    context: str | None = Field(None, description="Optional additional context")


class SourceDocument(BaseModel):
    """A source document used to generate the answer."""
    title: str
    content: str
    relevance_score: float = Field(ge=0, le=1)


class QueryResponse(BaseModel):
    """Response from the trade regulation AI."""
    answer: str
    sources: list[SourceDocument] = []
    confidence: float = Field(ge=0, le=1)
