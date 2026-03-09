"""Trade Regulation AI Service — RAG-based question answering.

Currently returns mock responses. Swap in LangChain + FAISS + LLM for production.
"""

from app.schemas.trade_ai import QueryRequest, QueryResponse, SourceDocument

# --- Sample knowledge base (replace with vector DB) ---
SAMPLE_REGULATIONS = [
    {
        "title": "ASEAN Trade in Goods Agreement (ATIGA)",
        "content": (
            "The ASEAN Trade in Goods Agreement eliminates import duties on 99% of "
            "products traded among ASEAN member states. Rules of Origin require at least "
            "40% ASEAN content for preferential tariff treatment."
        ),
    },
    {
        "title": "ASEAN Harmonized Tariff Nomenclature (AHTN)",
        "content": (
            "All ASEAN member states use the AHTN based on the HS Code system for "
            "classifying traded goods. Products must be correctly classified under the "
            "appropriate HS Code to determine applicable tariffs."
        ),
    },
    {
        "title": "Certificate of Origin (CO) Requirements",
        "content": (
            "Exporters must obtain a Certificate of Origin (Form D for ASEAN) from their "
            "country's trade ministry to qualify for preferential tariff rates. Self-"
            "certification is available for certified exporters in some member states."
        ),
    },
    {
        "title": "Customs Declaration Procedures",
        "content": (
            "All imports and exports must be declared through the national customs system. "
            "Required documents include commercial invoice, packing list, bill of lading, "
            "and applicable permits or licenses for restricted goods."
        ),
    },
    {
        "title": "MSME Export Incentives",
        "content": (
            "Several ASEAN countries offer export incentives for MSMEs including tax "
            "holidays, reduced export duties, simplified customs procedures, and access "
            "to trade financing at preferential rates."
        ),
    },
]


def _find_relevant_docs(question: str) -> list[SourceDocument]:
    """Simple keyword matching — replace with vector similarity search."""
    question_lower = question.lower()
    results = []
    for doc in SAMPLE_REGULATIONS:
        keywords = doc["title"].lower().split() + doc["content"].lower().split()
        overlap = sum(1 for word in question_lower.split() if word in keywords)
        if overlap > 0:
            score = min(overlap / max(len(question_lower.split()), 1), 1.0)
            results.append(
                SourceDocument(
                    title=doc["title"],
                    content=doc["content"],
                    relevance_score=round(score, 2),
                )
            )
    results.sort(key=lambda x: x.relevance_score, reverse=True)
    return results[:3]


async def query_trade_regulations(request: QueryRequest) -> QueryResponse:
    """Answer a trade regulation question using RAG (mock implementation)."""
    sources = _find_relevant_docs(request.question)

    if sources:
        context_text = "\n\n".join(f"[{s.title}]: {s.content}" for s in sources)
        answer = (
            f"Based on ASEAN trade regulations:\n\n"
            f"{sources[0].content}\n\n"
            f"(This answer is generated from {len(sources)} relevant regulation document(s). "
            f"Connect a real LLM for more detailed, synthesised responses.)"
        )
        confidence = sources[0].relevance_score
    else:
        answer = (
            "I couldn't find specific regulations matching your question. "
            "Please try rephrasing or ask about topics like tariffs, certificates of origin, "
            "customs procedures, HS codes, or MSME export incentives."
        )
        confidence = 0.1

    return QueryResponse(answer=answer, sources=sources, confidence=round(confidence, 2))
