"""Document Analysis AI Service — OCR and field extraction powered by Gemini.

Uses Gemini's multimodal capabilities to analyze document images/PDFs and extract
structured trade document information.
"""

import json
from app.schemas.document_ai import DocumentAnalysisResponse, ExtractedField
from app.services.gemini_client import generate_with_file

# Map common file extensions to MIME types
MIME_MAP = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
}

SYSTEM_INSTRUCTION = """You are an expert trade document analyzer specializing in ASEAN cross-border trade documents.

You will receive a document image or PDF. Analyze it and extract all relevant information.

Common trade documents include:
- Commercial invoices
- Packing lists
- Bills of lading
- Certificates of origin
- Customs declarations
- Import/export permits

Extract and return JSON in this exact format:
{
  "document_type": "commercial_invoice",
  "raw_text": "Full text content visible in the document",
  "fields": [
    {"field_name": "Invoice Number", "value": "INV-001", "confidence": 0.95},
    {"field_name": "Exporter", "value": "Company Name", "confidence": 0.90},
    {"field_name": "Importer", "value": "Company Name", "confidence": 0.88},
    {"field_name": "Product Name", "value": "Product", "confidence": 0.92},
    {"field_name": "HS Code", "value": "1234.56.78", "confidence": 0.85},
    {"field_name": "Quantity", "value": "100 units", "confidence": 0.90},
    {"field_name": "Unit Price", "value": "USD 10.00", "confidence": 0.88},
    {"field_name": "Total Value", "value": "USD 1000.00", "confidence": 0.90},
    {"field_name": "Country of Origin", "value": "Malaysia", "confidence": 0.95},
    {"field_name": "Date", "value": "2024-01-15", "confidence": 0.92}
  ]
}

Extract ALL fields visible in the document. Include confidence scores reflecting your certainty for each field.
If a field is partially legible, include it with a lower confidence score.
"""

PROMPT = "Analyze this trade document. Extract all fields and text content. Respond in the JSON format specified."


def _get_mime_type(filename: str) -> str:
    """Determine MIME type from filename extension."""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return MIME_MAP.get(ext, "application/octet-stream")


async def analyze_document(filename: str, file_content: bytes) -> DocumentAnalysisResponse:
    """Analyze an uploaded document using Gemini vision and extract structured fields."""
    mime_type = _get_mime_type(filename)

    raw_response = await generate_with_file(
        file_bytes=file_content,
        mime_type=mime_type,
        prompt=PROMPT,
        system_instruction=SYSTEM_INSTRUCTION,
    )

    # Parse Gemini's JSON response
    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        extracted_fields = [
            ExtractedField(
                field_name=f["field_name"],
                value=str(f["value"]),
                confidence=float(f.get("confidence", 0.8)),
            )
            for f in parsed.get("fields", [])
        ]

        return DocumentAnalysisResponse(
            filename=filename,
            extracted_fields=extracted_fields,
            raw_text=parsed.get("raw_text", ""),
            document_type=parsed.get("document_type", "unknown"),
        )
    except (json.JSONDecodeError, ValueError, KeyError):
        # If parsing fails, return the raw text
        return DocumentAnalysisResponse(
            filename=filename,
            extracted_fields=[],
            raw_text=raw_response,
            document_type="unknown",
        )
