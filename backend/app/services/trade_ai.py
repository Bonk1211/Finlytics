"""Trade Regulation AI Service — RAG-based question answering powered by Gemini.

Uses Gemini with a curated knowledge base of ASEAN trade regulations as context.
"""

import json
import asyncio
import logging
from app.schemas.trade_ai import (
    QueryRequest, QueryResponse, SourceDocument,
    ComplianceDocRequest, ComplianceDocResponse,
    TariffLookupRequest, TariffLookupResponse,
    HSCodeSuggestRequest, HSCodeSuggestResponse, HSCodeSuggestion,
)
from app.services.gemini_client import generate, generate_embedding
from app.services.agent import run_langgraph_agent
from app.services.mem0_client import get_memories_async, add_memory_async
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

# --- Knowledge base seed data ---
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
        "regulation_type": "agreement",
    },
    {
        "title": "ASEAN Harmonized Tariff Nomenclature (AHTN)",
        "content": (
            "All ASEAN member states use the AHTN based on the HS Code system for "
            "classifying traded goods. Products must be correctly classified under the "
            "appropriate HS Code to determine applicable tariffs. The AHTN is updated "
            "every 5 years to align with the World Customs Organization nomenclature."
        ),
        "regulation_type": "tariff",
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
        "regulation_type": "customs",
    },
    {
        "title": "Customs Declaration Procedures",
        "content": (
            "All imports and exports must be declared through the national customs system. "
            "Required documents include commercial invoice, packing list, bill of lading, "
            "and applicable permits or licenses for restricted goods. ASEAN Single Window "
            "facilitates electronic exchange of trade documents between member states."
        ),
        "regulation_type": "customs",
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
        "regulation_type": "general",
    },
    {
        "title": "Restricted and Prohibited Goods",
        "content": (
            "Each ASEAN member state maintains a list of restricted and prohibited goods. "
            "Common restrictions include arms and ammunition, narcotics, endangered species, "
            "hazardous chemicals, and certain agricultural products requiring phytosanitary "
            "certificates. Import permits may be required for controlled items."
        ),
        "regulation_type": "restriction",
    },
    {
        "title": "ASEAN Economic Community (AEC) Trade Provisions",
        "content": (
            "The AEC aims for a single market and production base with free flow of goods, "
            "services, investment, skilled labor, and capital. Trade provisions include "
            "mutual recognition arrangements, elimination of non-tariff barriers, and "
            "harmonization of standards across member states."
        ),
        "regulation_type": "agreement",
    },
]

_seeded = False

# --- HS Code seed data for Smart HS Code Matcher ---
HS_CODES_SEED = [
    # Agriculture & Food
    {"hs_code": "0901.11", "description": "Coffee, not roasted, not decaffeinated", "category": "agriculture"},
    {"hs_code": "0803.90", "description": "Bananas, including plantains, fresh or dried", "category": "agriculture"},
    {"hs_code": "0904.11", "description": "Pepper of the genus Piper, neither crushed nor ground", "category": "agriculture"},
    {"hs_code": "0910.11", "description": "Ginger, neither crushed nor ground", "category": "agriculture"},
    {"hs_code": "1006.30", "description": "Semi-milled or wholly milled rice, whether or not polished or glazed", "category": "agriculture"},
    {"hs_code": "1511.10", "description": "Crude palm oil", "category": "agriculture"},
    {"hs_code": "1513.11", "description": "Crude coconut (copra) oil", "category": "agriculture"},
    {"hs_code": "0306.17", "description": "Other shrimps and prawns, frozen", "category": "seafood"},
    {"hs_code": "1604.14", "description": "Prepared or preserved tunas, skipjack and bonito", "category": "seafood"},
    {"hs_code": "2101.11", "description": "Extracts, essences and concentrates of coffee", "category": "food_products"},
    # Textiles & Apparel
    {"hs_code": "5208.12", "description": "Plain weave unbleached cotton fabrics, weighing more than 100 g/m2", "category": "textiles"},
    {"hs_code": "6109.10", "description": "T-shirts, singlets and other vests, of cotton, knitted or crocheted", "category": "apparel"},
    {"hs_code": "6110.20", "description": "Jerseys, pullovers, cardigans, waistcoats of cotton, knitted", "category": "apparel"},
    {"hs_code": "6214.10", "description": "Shawls, scarves, mufflers, mantillas, veils of silk or silk waste", "category": "apparel"},
    # Electronics & Machinery
    {"hs_code": "8471.30", "description": "Portable digital automatic data processing machines, weighing not more than 10 kg", "category": "electronics"},
    {"hs_code": "8517.12", "description": "Telephones for cellular networks or other wireless networks", "category": "electronics"},
    {"hs_code": "8443.32", "description": "Printers, copying machines and facsimile machines", "category": "electronics"},
    {"hs_code": "8501.10", "description": "Electric motors of an output not exceeding 37.5 W", "category": "electronics"},
    {"hs_code": "8504.40", "description": "Static converters, including power supplies and adapters", "category": "electronics"},
    {"hs_code": "8541.40", "description": "Photosensitive semiconductor devices, including solar cells and panels", "category": "electronics"},
    # Wood, Furniture & Handicrafts
    {"hs_code": "4407.29", "description": "Wood sawn or chipped lengthwise, sliced or peeled, of tropical wood", "category": "wood"},
    {"hs_code": "4421.99", "description": "Other articles of wood not elsewhere specified", "category": "wood"},
    {"hs_code": "9403.89", "description": "Furniture of cane, osier, bamboo or similar materials", "category": "furniture"},
    {"hs_code": "4602.11", "description": "Basketwork, wickerwork and other articles of vegetable plaiting materials, of bamboo", "category": "handicrafts"},
    {"hs_code": "7113.19", "description": "Articles of jewellery and parts thereof, of precious metal", "category": "handicrafts"},
    {"hs_code": "6802.29", "description": "Worked monumental or building stone and articles thereof", "category": "handicrafts"},
    # Rubber & Automotive
    {"hs_code": "4001.21", "description": "Natural rubber in smoked sheets", "category": "rubber"},
    {"hs_code": "4011.10", "description": "New pneumatic tyres, of rubber, of a kind used on motor cars", "category": "automotive"},
    # Beauty & Personal Care
    {"hs_code": "3304.10", "description": "Lip make-up preparations including lipstick", "category": "beauty"},
    {"hs_code": "3305.10", "description": "Shampoos and hair care preparations", "category": "beauty"},
]

_hs_codes_seeded = False


async def _ensure_hs_codes_seeded() -> None:
    """Seed hs_codes table with embeddings if empty. Runs once."""
    global _hs_codes_seeded
    if _hs_codes_seeded:
        return
    _hs_codes_seeded = True

    db = get_supabase()
    if db is None:
        logger.warning("Supabase not configured — skipping HS codes seed")
        return

    existing = db.table("hs_codes").select("id", count="exact").limit(1).execute()
    if existing.count and existing.count > 0:
        logger.info("HS codes already seeded (%d rows)", existing.count)
        return

    logger.info("Seeding %d HS codes with embeddings...", len(HS_CODES_SEED))
    for item in HS_CODES_SEED:
        try:
            embedding = await generate_embedding(f"{item['hs_code']} {item['description']}")
            db.table("hs_codes").insert({
                "hs_code": item["hs_code"],
                "description": item["description"],
                "category": item["category"],
                "embedding": embedding,
            }).execute()
        except Exception as e:
            logger.error("Failed to seed HS code '%s': %s", item["hs_code"], e)
    logger.info("HS codes seeding complete")


async def suggest_hs_codes(request: HSCodeSuggestRequest) -> HSCodeSuggestResponse:
    """Suggest HS codes from a plain-language product description using semantic search + Gemini."""
    await _ensure_hs_codes_seeded()

    query = request.query
    db = get_supabase()

    if db is None:
        # Fallback: simple keyword matching against seed data
        query_lower = query.lower()
        matches = [
            HSCodeSuggestion(
                hs_code=h["hs_code"],
                description=h["description"],
                confidence=0.5,
                ai_explanation=f"This code covers {h['description'].lower()}.",
            )
            for h in HS_CODES_SEED
            if any(word in h["description"].lower() for word in query_lower.split() if len(word) > 2)
        ][:3]
        return HSCodeSuggestResponse(suggestions=matches, query=query)

    try:
        query_embedding = await generate_embedding(query)
        result = db.rpc("match_hs_codes", {
            "query_embedding": query_embedding,
            "match_threshold": 0.2,
            "match_count": 5,
        }).execute()

        if not result.data:
            return HSCodeSuggestResponse(suggestions=[], query=query)

        top_matches = result.data[:3]

        # Ask Gemini to generate plain-English explanations (non-fatal)
        explanations: dict[str, str] = {}
        try:
            codes_text = "\n".join(
                f"- HS {m['hs_code']}: {m['description']} (similarity: {m['similarity']:.2f})"
                for m in top_matches
            )

            explanation_prompt = f"""The user searched for: "{query}"

These HS codes were found as potential matches:
{codes_text}

For each HS code, write ONE concise sentence explaining to a small business owner why this code fits their product. Be specific and practical.

Respond in JSON format:
{{
  "explanations": {{
    "<hs_code>": "explanation sentence"
  }}
}}"""

            raw = await generate(
                explanation_prompt,
                system_instruction="You are a customs classification expert helping small businesses understand HS codes. Be concise, clear, and helpful.",
            )

            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                cleaned = cleaned.rsplit("```", 1)[0]
            parsed = json.loads(cleaned)
            explanations = parsed.get("explanations", {})
        except Exception as e:
            logger.warning("Gemini explanation failed (non-fatal): %s", e)

        suggestions = [
            HSCodeSuggestion(
                hs_code=m["hs_code"],
                description=m["description"],
                confidence=round(min(max(m["similarity"], 0), 1.0), 2),
                ai_explanation=explanations.get(
                    m["hs_code"],
                    f"This code covers {m['description'].lower()}.",
                ),
            )
            for m in top_matches
        ]

        return HSCodeSuggestResponse(suggestions=suggestions, query=query)

    except Exception as e:
        logger.error("HS code suggestion failed: %s", e)
        return HSCodeSuggestResponse(suggestions=[], query=query)


async def _ensure_regulations_seeded() -> None:
    """Seed trade_regulations table with embeddings if empty. Runs once."""
    global _seeded
    if _seeded:
        return
    _seeded = True

    db = get_supabase()
    if db is None:
        logger.warning("Supabase not configured — skipping trade regulations seed")
        return

    existing = db.table("trade_regulations").select("id", count="exact").limit(1).execute()
    if existing.count and existing.count > 0:
        logger.info("Trade regulations already seeded (%d rows)", existing.count)
        return

    logger.info("Seeding %d trade regulations with embeddings...", len(TRADE_REGULATIONS))
    for doc in TRADE_REGULATIONS:
        try:
            embedding = await generate_embedding(doc["content"])
            db.table("trade_regulations").insert({
                "title": doc["title"],
                "content": doc["content"],
                "regulation_type": doc["regulation_type"],
                "embedding": embedding,
            }).execute()
        except Exception as e:
            logger.error("Failed to seed regulation '%s': %s", doc["title"], e)
    logger.info("Trade regulations seeding complete")


async def _search_regulations(query: str, n_results: int = 3) -> list[dict]:
    """Search trade regulations using pgvector similarity or fallback to text match."""
    db = get_supabase()
    if db is None:
        # Fallback: return all regulations as context (no DB)
        return [{"title": d["title"], "content": d["content"]} for d in TRADE_REGULATIONS[:n_results]]

    try:
        query_embedding = await generate_embedding(query)
        result = db.rpc("match_trade_regulations", {
            "query_embedding": query_embedding,
            "match_threshold": 0.3,
            "match_count": n_results,
        }).execute()

        if result.data:
            return [{"title": r["title"], "content": r["content"], "similarity": r["similarity"]} for r in result.data]
    except Exception as e:
        logger.warning("pgvector search failed, falling back to text: %s", e)

    # Fallback: simple text search
    try:
        result = db.table("trade_regulations").select("title, content").limit(n_results).execute()
        return [{"title": r["title"], "content": r["content"]} for r in result.data]
    except Exception:
        return [{"title": d["title"], "content": d["content"]} for d in TRADE_REGULATIONS[:n_results]]

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
    """Answer a trade regulation question using Gemini + Supabase pgvector context."""
    # Ensure regulations are seeded on first call
    await _ensure_regulations_seeded()

    # Semantic search via Supabase pgvector
    matched_docs = await _search_regulations(request.question, n_results=3)

    context_text = ""
    retrieved_titles = []
    if matched_docs:
        for doc in matched_docs:
            retrieved_titles.append(doc["title"])
            context_text += f"### {doc['title']}\n{doc['content']}\n\n"
    else:
        context_text = "No relevant context found in the database."

    # Fetch user memory from Mem0
    user_memory = await get_memories_async(request.user_id, query=request.question)
    memory_text = f"\n\n## Past Memory & Context (Mem0)\n{user_memory}" if user_memory else ""

    prompt = f"""## Context Documents (from Vector DB)

{context_text}
{memory_text}

## User Question

{request.question}"""

    if request.context:
        prompt += f"\n\n## Additional Context from User\n{request.context}"

    prompt += "\n\nRespond in the JSON format specified in your instructions. ONLY use the provided Context Documents and act agentically."

    # LangGraph agent adds multi-step tool execution and reflection
    raw_response = await run_langgraph_agent(prompt, system_instruction=SYSTEM_INSTRUCTION)

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

    # Store memory in the background
    asyncio.create_task(
        add_memory_async(
            messages=[
                {"role": "user", "content": request.question},
                {"role": "assistant", "content": answer}
            ],
            user_id=request.user_id
        )
    )

    return QueryResponse(
        answer=answer,
        sources=sources,
        confidence=round(min(max(confidence, 0), 1), 2),
    )


DOC_SYSTEM_INSTRUCTION = """You are an expert trade compliance officer.

Generate trade compliance documents (like Commercial Invoices, Packing Lists, Certificates of Origin)
based on the provided transaction details.

Respond in JSON format:
{
  "document_title": "Commercial Invoice",
  "document_content": "The full document content formatted cleanly in markdown...",
  "missing_information": ["List any required fields that were missing from the input"]
}

Rules:
- Make the document professional and ready to use.
- Identify any mandatory information missing (e.g., HS Codes, Incoterms) in missing_information.
"""


async def generate_compliance_document(request: ComplianceDocRequest) -> ComplianceDocResponse:
    """Generate trade compliance documents using Gemini."""
    details_str = "\n".join(f"- {k}: {v}" for k, v in request.transaction_details.items())

    prompt = f"""## Request: Generate a {request.document_type}
## Route: {request.source_country} to {request.destination_country}

## Transaction Details:
{details_str}

Please generate the document and respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=DOC_SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        result = ComplianceDocResponse(
            document_title=parsed.get("document_title", request.document_type),
            document_content=parsed.get("document_content", raw_response),
            missing_information=parsed.get("missing_information", []),
        )
    except (json.JSONDecodeError, ValueError):
        result = ComplianceDocResponse(
            document_title=request.document_type,
            document_content=raw_response,
            missing_information=[],
        )

    # Persist compliance document to Supabase
    _persist_compliance_document(request, result)
    return result


TARIFF_SYSTEM_INSTRUCTION = """You are an ASEAN customs and tariff expert.

Provide tariff rates, estimated HS codes, and export/import requirements for products
moving between specific countries.

Respond in JSON format:
{
  "product_category": "General category",
  "estimated_hs_code": "1234.56",
  "applicable_tariffs": ["Standard MFN rate: 10%"],
  "preferential_rates": "ATIGA rate: 0% (if Certificate of Origin Form D is provided)",
  "required_documents": ["Commercial Invoice", "Packing List", "Bill of Lading"],
  "import_restrictions": ["Requires import permit from Ministry of Agriculture"],
  "ai_summary": "Overall assessment of trade friction and requirements"
}
"""


async def lookup_tariff(request: TariffLookupRequest) -> TariffLookupResponse:
    """Look up tariffs and export requirements using Gemini."""
    prompt = f"""## Product: {request.product_name}
## HS Code: {request.hs_code or 'Not provided - please estimate'}
## Route: {request.source_country} to {request.destination_country}

Provide customs, tariff, and regulatory requirements.
Respond in the JSON format specified."""

    raw_response = await generate(prompt, system_instruction=TARIFF_SYSTEM_INSTRUCTION)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned)

        return TariffLookupResponse(
            product_category=parsed.get("product_category", ""),
            estimated_hs_code=parsed.get("estimated_hs_code", request.hs_code),
            applicable_tariffs=parsed.get("applicable_tariffs", []),
            preferential_rates=parsed.get("preferential_rates", ""),
            required_documents=parsed.get("required_documents", []),
            import_restrictions=parsed.get("import_restrictions", []),
            ai_summary=parsed.get("ai_summary", ""),
        )
    except (json.JSONDecodeError, ValueError):
        return TariffLookupResponse(
            product_category="Unknown",
            estimated_hs_code=request.hs_code,
            applicable_tariffs=[],
            preferential_rates="",
            required_documents=[],
            import_restrictions=[],
            ai_summary=raw_response,
        )


def _persist_compliance_document(
    request: ComplianceDocRequest, result: ComplianceDocResponse
) -> None:
    """Log generated compliance document to Supabase. Never raises."""
    try:
        db = get_supabase()
        if db is None:
            return

        # Map free-text document_type to enum value
        doc_type_map = {
            "certificate of origin": "certificate_of_origin",
            "commercial invoice": "commercial_invoice",
            "packing list": "packing_list",
            "customs declaration": "customs_declaration",
        }
        doc_type = doc_type_map.get(
            request.document_type.lower(), "other"
        )

        db.table("compliance_documents").insert({
            "document_type": doc_type,
            "origin_country": request.source_country,
            "destination_country": request.destination_country,
            "product_description": request.transaction_details.get("product", ""),
            "hs_code": request.transaction_details.get("hs_code", ""),
            "generated_content": {
                "title": result.document_title,
                "content": result.document_content,
                "missing_information": result.missing_information,
            },
            "status": "draft",
        }).execute()
    except Exception as e:
        logger.warning("Failed to persist compliance document: %s", e)
