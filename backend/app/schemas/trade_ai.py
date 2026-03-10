from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Request to ask a trade regulation question."""
    question: str = Field(..., min_length=1, description="The trade regulation question to ask")
    context: str | None = Field(None, description="Optional additional context")
    user_id: str = Field("default_msme", description="User ID for Mem0 contextual memory")


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


# --- Compliance Document Generation ---

class ComplianceDocRequest(BaseModel):
    """Request to generate a trade compliance document."""
    document_type: str = Field(..., description="e.g., Commercial Invoice, Certificate of Origin, Packing List")
    transaction_details: dict = Field(..., description="Dictionary of transaction details (buyer, seller, products, values, etc.)")
    source_country: str = ""
    destination_country: str = ""


class ComplianceDocResponse(BaseModel):
    """Generated compliance document."""
    document_title: str
    document_content: str = Field(..., description="Markdown or text representation of the generated document")
    missing_information: list[str] = Field(default=[], description="Information needed but not provided")
    disclaimer: str = "This is an AI-generated draft. Please review and consult with a trade professional before official use."


# --- Tariff and Export Requirements Lookup ---

class TariffLookupRequest(BaseModel):
    """Request to look up tariffs and export requirements."""
    product_name: str
    hs_code: str = ""
    source_country: str = Field(..., description="Origin country")
    destination_country: str = Field(..., description="Target export country")


class TariffLookupResponse(BaseModel):
    """Tariff and requirement information."""
    product_category: str
    estimated_hs_code: str
    applicable_tariffs: list[str] = []
    preferential_rates: str = ""
    required_documents: list[str] = []
    import_restrictions: list[str] = []
    ai_summary: str


# --- Smart HS Code Matcher ---

class HSCodeSuggestion(BaseModel):
    """A single HS code suggestion with confidence and AI explanation."""
    hs_code: str
    description: str
    confidence: float = Field(ge=0, le=1)
    ai_explanation: str


class HSCodeSuggestRequest(BaseModel):
    """Request to find HS codes from a plain-language product description."""
    query: str = Field(..., min_length=1, description="Product description in everyday language")


class HSCodeSuggestResponse(BaseModel):
    """Response with AI-suggested HS codes."""
    suggestions: list[HSCodeSuggestion] = []
    query: str
