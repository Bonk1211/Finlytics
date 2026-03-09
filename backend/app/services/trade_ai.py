"""Trade Regulation AI Service — RAG-based question answering powered by Gemini.

Uses Gemini with a curated knowledge base of ASEAN trade regulations as context.
"""

import json
from app.schemas.trade_ai import QueryRequest, QueryResponse, SourceDocument
from app.services.gemini_client import generate

# --- Knowledge base (replace with vector DB for production scale) ---
TRADE_REGULATIONS = [
    {
        "title": "ASEAN Trade in Goods Agreement (ATIGA)",
        "content": (
            "The ASEAN Trade in Goods Agreement eliminates import duties on 99% of "
            "products traded among ASEAN member states. Rules of Origin require at least "
            "40% ASEAN content for preferential tariff treatment. The agreement covers "
            "tariff liberalization, non-tariff measures, trade facilitation, customs "
            "procedures, and standards and conformance."
        ),
    },
    {
        "title": "ASEAN Harmonized Tariff Nomenclature (AHTN)",
        "content": (
            "All ASEAN member states use the AHTN based on the HS Code system for "
            "classifying traded goods. Products must be correctly classified under the "
            "appropriate HS Code to determine applicable tariffs. The AHTN is updated "
            "every 5 years to align with the World Customs Organization nomenclature."
        ),
    },
    {
        "title": "Certificate of Origin (CO) Requirements",
        "content": (
            "Exporters must obtain a Certificate of Origin (Form D for ASEAN) from their "
            "country's trade ministry to qualify for preferential tariff rates. Self-"
            "certification is available for certified exporters in some member states. "
            "Required supporting documents include commercial invoice, packing list, "
            "and bill of lading."
        ),
    },
    {
        "title": "Customs Declaration Procedures",
        "content": (
            "All imports and exports must be declared through the national customs system. "
            "Required documents include commercial invoice, packing list, bill of lading, "
            "and applicable permits or licenses for restricted goods. ASEAN Single Window "
            "facilitates electronic exchange of trade documents between member states."
        ),
    },
    {
        "title": "MSME Export Incentives",
        "content": (
            "Several ASEAN countries offer export incentives for MSMEs including tax "
            "holidays, reduced export duties, simplified customs procedures, and access "
            "to trade financing at preferential rates. Malaysia offers SME Corp grants, "
            "Indonesia has KUR loans, Thailand provides BOI incentives, and Vietnam "
            "offers VIETRADE support programs."
        ),
    },
    {
        "title": "Restricted and Prohibited Goods",
        "content": (
            "Each ASEAN member state maintains a list of restricted and prohibited goods. "
            "Common restrictions include arms and ammunition, narcotics, endangered species, "
            "hazardous chemicals, and certain agricultural products requiring phytosanitary "
            "certificates. Import permits may be required for controlled items."
        ),
    },
    {
        "title": "ASEAN Economic Community (AEC) Trade Provisions",
        "content": (
            "The AEC aims for a single market and production base with free flow of goods, "
            "services, investment, skilled labor, and capital. Trade provisions include "
            "mutual recognition arrangements, elimination of non-tariff barriers, and "
            "harmonization of standards across member states."
        ),
    },
]

SYSTEM_INSTRUCTION = """You are an expert ASEAN trade regulation advisor for MSMEs (Micro, Small and Medium Enterprises).

You will be given a question about trade regulations and a set of relevant regulation documents as context.

Your task:
1. Answer the question accurately based on the provided context documents.
2. If the context doesn't fully cover the question, say so clearly and provide what guidance you can.
3. Be practical and actionable — MSMEs need clear, step-by-step guidance.
4. Reference specific regulations, forms, or procedures when relevant.

Respond in JSON format with these fields:
{
  "answer": "Your detailed answer here",
  "sources_used": ["Title of source 1", "Title of source 2"],
  "confidence": 0.85
}

The confidence score should reflect how well the context documents address the question (0.0 to 1.0).
"""


async def query_trade_regulations(request: QueryRequest) -> QueryResponse:
    """Answer a trade regulation question using Gemini + regulation context."""
    # Build context from knowledge base
    context_text = "\n\n".join(
        f"### {doc['title']}\n{doc['content']}" for doc in TRADE_REGULATIONS
    )

    prompt = f"""## Context Documents

{context_text}

## User Question

{request.question}"""

    if request.context:
        prompt += f"\n\n## Additional Context from User\n{request.context}"

    prompt += "\n\nRespond in the JSON format specified in your instructions."

    raw_response = await generate(prompt, system_instruction=SYSTEM_INSTRUCTION)

    # Parse the JSON response from Gemini
    try:
        # Strip markdown code fences if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]  # remove first line
            cleaned = cleaned.rsplit("```", 1)[0]  # remove last fence
        parsed = json.loads(cleaned)

        answer = parsed.get("answer", raw_response)
        confidence = float(parsed.get("confidence", 0.7))
        sources_used = parsed.get("sources_used", [])

        # Build source documents from the titles referenced
        sources = []
        for doc in TRADE_REGULATIONS:
            if doc["title"] in sources_used:
                sources.append(
                    SourceDocument(
                        title=doc["title"],
                        content=doc["content"],
                        relevance_score=round(confidence, 2),
                    )
                )
    except (json.JSONDecodeError, ValueError):
        # If Gemini didn't return valid JSON, use raw text
        answer = raw_response
        confidence = 0.7
        sources = []

    return QueryResponse(
        answer=answer,
        sources=sources,
        confidence=round(min(max(confidence, 0), 1), 2),
    )
