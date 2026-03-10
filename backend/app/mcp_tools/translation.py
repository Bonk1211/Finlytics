"""Translation tool."""

import json
from typing import Annotated

from app.mcp_tools import mcp
from app.services.translation import translate_text as _translate_text
from app.schemas.translation import TranslateRequest, SupportedLanguage


@mcp.tool()
async def translate_text(
    text: Annotated[str, "Text to translate"],
    target_language: Annotated[str, "Target language code: en, ms (Malay), id (Indonesian), th (Thai), vi (Vietnamese), zh (Chinese)"],
    source_language: Annotated[str, "Source language code (leave empty for auto-detect)"] = "",
) -> str:
    """Translate text between ASEAN languages.

    Supported languages: en (English), ms (Malay), id (Indonesian), th (Thai),
    vi (Vietnamese), zh (Chinese). Call this when the user needs translation.
    """
    try:
        src = SupportedLanguage(source_language) if source_language else None
        tgt = SupportedLanguage(target_language)
        result = await _translate_text(
            TranslateRequest(text=text, source_language=src, target_language=tgt)
        )
        return result.model_dump_json(indent=2)
    except ValueError:
        return json.dumps({
            "error": "Unsupported language code. Use: en, ms, id, th, vi, zh"
        })
    except Exception as e:
        return json.dumps({"error": str(e)})
