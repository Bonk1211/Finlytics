"""Document Analysis AI Service — OCR and field extraction.

Currently returns mock extraction results. Swap in Tesseract/PaddleOCR + LayoutLMv3 for production.
"""

from app.schemas.document_ai import DocumentAnalysisResponse, ExtractedField

# --- Mock extraction templates ---
INVOICE_FIELDS = [
    ExtractedField(field_name="Invoice Number", value="INV-2024-001234", confidence=0.95),
    ExtractedField(field_name="Exporter", value="Borneo Trading Co. Sdn Bhd", confidence=0.92),
    ExtractedField(field_name="Importer", value="Vietnam Import Corp.", confidence=0.90),
    ExtractedField(field_name="Product Name", value="Palm Oil (Refined)", confidence=0.94),
    ExtractedField(field_name="HS Code", value="1511.90.00", confidence=0.88),
    ExtractedField(field_name="Quantity", value="500 MT", confidence=0.91),
    ExtractedField(field_name="Unit Price", value="USD 850/MT", confidence=0.89),
    ExtractedField(field_name="Total Value", value="USD 425,000.00", confidence=0.93),
    ExtractedField(field_name="Country of Origin", value="Malaysia", confidence=0.96),
    ExtractedField(field_name="Port of Loading", value="Port Klang", confidence=0.87),
]


async def analyze_document(filename: str, file_content: bytes) -> DocumentAnalysisResponse:
    """Analyze an uploaded document and extract structured fields (mock)."""
    # In production: run OCR → layout analysis → field extraction
    raw_text = (
        "COMMERCIAL INVOICE\n"
        "Invoice No: INV-2024-001234\n"
        "Date: 2024-01-15\n"
        "Exporter: Borneo Trading Co. Sdn Bhd\n"
        "Importer: Vietnam Import Corp.\n"
        "Product: Palm Oil (Refined)\n"
        "HS Code: 1511.90.00\n"
        "Quantity: 500 MT\n"
        "Unit Price: USD 850/MT\n"
        "Total: USD 425,000.00\n"
    )

    return DocumentAnalysisResponse(
        filename=filename,
        extracted_fields=INVOICE_FIELDS,
        raw_text=raw_text,
        document_type="commercial_invoice",
    )
