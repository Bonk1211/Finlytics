# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install everything (backend venv + frontend node_modules)
make install

# Start all services (frontend + backend + MCP server)
make start    # or: make dev
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8000  (Swagger at /docs)
# MCP Server:  http://localhost:8080/mcp/
```

### Running services individually

```bash
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev

# MCP server (standalone)
cd backend && source venv/bin/activate && fastmcp run app/mcp_tools/__init__.py:mcp --transport http --host 127.0.0.1 --port 8080 --reload
```

### Build & Lint

```bash
cd frontend && npm run build   # Next.js production build
cd frontend && npm run lint     # ESLint
```

## Architecture

Two-service monorepo: **FastAPI backend** + **Next.js frontend**, communicating via REST. Supabase provides PostgreSQL + pgvector + auth.

### Backend (`backend/app/`)

Layered structure with 1:1 correspondence between layers:

- **`routers/`** — FastAPI route handlers, all mounted under `/api` prefix in `main.py`
- **`schemas/`** — Pydantic request/response models (frontend `api.ts` must match these exactly)
- **`services/`** — Business logic. Each service can call `supabase_client.get_supabase()` for DB access and `gemini_client` for AI
- **`mcp_tools/`** — FastMCP tool definitions organized by domain. The `__init__.py` creates the shared `mcp` FastMCP instance and imports all tool modules

Key services:
- `agent.py` — LangGraph multi-agent system (Supervisor → Researcher + Quant workers) with 11 tools
- `trade_ai.py` — RAG using Supabase pgvector (`match_trade_regulations` RPC) for regulation search
- `supabase_client.py` — Singleton client, returns `None` if unconfigured (stateless mode)
- `gemini_client.py` — Shared Google Gemini client

Configuration: `config.py` uses `pydantic-settings` loading from `backend/.env`. See `.env.example` for required keys (GEMINI_API_KEY, GEMINI_MODEL are required; SUPABASE_*, TAVILY_*, etc. are optional).

### Frontend (`frontend/src/`)

Next.js 16 App Router with TypeScript and Tailwind CSS v4.

- **`app/`** — Route pages (dashboard at `/`, feature pages at `/credit`, `/trade`, `/market`, `/ai`, `/supply-chain`, `/worldmonitor`, `/visibility-engine`)
- **`components/`** — Shared UI (sidebar, topnav, ai-chat widget, chart/metric cards, world-map)
- **`lib/api.ts`** — Centralized API client; all backend calls go through `request<T>()`. Interface types here must stay in sync with backend `schemas/`
- **`lib/language-context.tsx`** — i18n context provider with dictionaries in `lib/dictionaries/`

Layout wraps all pages in `LanguageProvider` + `TopNav`. No sidebar in the layout — individual pages include it.

### Supabase

- pgvector extension for trade regulation embeddings (3072-dim `gemini-embedding-001`)
- `match_trade_regulations()` RPC function for similarity search
- 5 tables have nullable `msme_id` for pre-auth operation
- Migrations tracked in `supabase/migrations/`

### MCP Integration

The MCP server runs in two modes:
1. **Mounted in FastAPI** — `mcp_app` is integrated into the main FastAPI lifespan and router
2. **Standalone** — run via `fastmcp run` for direct HTTP/SSE access on port 8080

## Design System

Neutrade-inspired bento box layout. Key tokens defined in `frontend/src/app/globals.css`:
- Primary: `#3B82F6`, Success: `#10B981`, Danger: `#EF4444`
- Card radius: 20px, pill-shaped buttons, subtle diffuse shadows
- AI accent colors: Mint, Lavender, Purple
- Full spec in `docs/ui-style.md`

## Environment

- Backend: Python 3.10+ with venv at `backend/venv/`
- Frontend: Node.js 18+, npm (use `--legacy-peer-deps` if needed)
- Required API key: `GEMINI_API_KEY` in `backend/.env`
