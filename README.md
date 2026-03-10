<p align="center">
  <img src="https://img.shields.io/badge/BorneoHack-MSME%20Trade%20AI-10B981?style=for-the-badge&logo=globe&logoColor=white" alt="BorneoHack" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/LangGraph-FF6B35?style=for-the-badge&logo=chainlink&logoColor=white" alt="LangGraph" />
</p>

# 🌏 BorneoHack — ASEAN Cross-Border Trade & Fintech Platform

> **An AI-powered platform empowering ASEAN MSMEs (Micro, Small, and Medium Enterprises) with cross-border trade intelligence, alternative credit scoring, supply chain optimization, and real-time market analytics.**

Built for the BorneoHack hackathon, this full-stack application combines a **FastAPI** backend with a **Next.js** frontend, powered by **Google Gemini AI** and a **LangGraph multi-agent orchestrator**.

---

## ✨ Key Features

### 🤖 AI-Finance Assist (Multi-Agent Chatbot)
- **LangGraph Multi-Agent Orchestrator** — Supervisor Agent delegates tasks to specialist sub-agents
- **Researcher Agent** (7 tools) — Web search, ASEAN news, chart/graph generation, image generation, tariff guidance, TTS
- **Quant Agent** (4 tools) — Calculator, stock prices, live currency conversion, loan amortization
- **Prompt Injection Protection** — Hardened system prompts with security directives
- **MCP Integration** — Model Context Protocol server exposing tools over SSE
- **Markdown-rendered responses** with tables, charts, and images inline

### 🌐 Cross-Border Trade Navigator
- AI-powered Q&A on ASEAN import/export regulations
- RAG-based semantic search over trade regulation knowledge base (Supabase pgvector)
- Auto-generated compliance documents (Commercial Invoice, Certificate of Origin)
- Tariff lookup with HS code estimation under ATIGA framework

### 📊 Alternative Credit Scoring
- AI credit model using 11+ non-traditional data points
- Assesses unbanked/offline businesses via digital transaction ratios, mobile payment volume, inventory turnover, supplier reliability, and customer ratings
- Visual score dial with risk tier classification and AI recommendations

### 📦 Automated Supply Chain Management
- Smart supplier recommendation engine
- Demand forecasting and inventory optimization
- Regional supplier matching across ASEAN countries

### 🗺️ World Monitor Command Center
- Real-time geopolitical risk surveillance with interactive map
- Live USGS earthquake data layer integration
- Multi-stream live news (Al Jazeera, Sky News, Euronews, DW)
- Live webcam feeds from global hotspots
- Country instability indices with dynamic risk scoring

### 🏪 Business Visibility Engine
- Digital onboarding for offline businesses
- Multi-step verified profile creation
- Supply chain identity generation (MSME-ID)

### 📈 MSME Dashboard
- Revenue & expense analytics with interactive Recharts visualizations
- Smart Process Manager (Kanban-style workflow)
- Market intelligence summary with regional breakdown

---

## 🏗️ Architecture

```
BorneoHack/
├── backend/                          # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                   # Application entry point & CORS
│   │   ├── config.py                 # Pydantic settings from .env
│   │   ├── routers/
│   │   │   ├── chatbot.py            # AI-Finance Assist endpoint
│   │   │   ├── trade_ai.py           # Trade Navigator (RAG + Compliance)
│   │   │   ├── credit.py             # Alternative Credit Scoring
│   │   │   ├── supply_chain.py       # Supply Chain Optimization
│   │   │   ├── market.py             # Predictive Market Analytics
│   │   │   ├── document_ai.py        # Document Processing
│   │   │   ├── translation.py        # Multi-language Translation
│   │   │   ├── inventory.py          # Inventory Management
│   │   │   ├── dashboard.py          # Dashboard Analytics
│   │   │   ├── mcp.py                # Model Context Protocol Server
│   │   │   └── health.py             # Health Check
│   │   ├── services/
│   │   │   ├── agent.py              # LangGraph Multi-Agent System (11 tools)
│   │   │   ├── trade_ai.py           # Trade AI RAG + Semantic Search
│   │   │   ├── gemini_client.py      # Google Gemini API Client
│   │   │   ├── credit.py             # Credit Scoring Engine
│   │   │   ├── supply_chain.py       # Supply Chain Logic
│   │   │   ├── market.py             # Market Analytics
│   │   │   ├── document_ai.py        # Document AI Service
│   │   │   ├── translation.py        # Translation Service
│   │   │   ├── inventory.py          # Inventory Service
│   │   │   ├── dashboard.py          # Dashboard Service
│   │   │   ├── mem0_client.py        # Mem0 Memory Client
│   │   │   └── supabase_client.py    # Supabase Client
│   │   └── schemas/                  # Pydantic request/response models
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         # Next.js TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Main Dashboard
│   │   │   ├── trade-navigator/      # Trade Navigator Chat
│   │   │   ├── credit-scoring/       # Credit Scoring UI
│   │   │   ├── supply-chain/         # Supply Chain Management
│   │   │   ├── worldmonitor/         # World Monitor Command Center
│   │   │   ├── visibility-engine/    # Business Visibility Engine
│   │   │   └── globals.css           # Design System & Tokens
│   │   └── components/
│   │       ├── ai-chat.tsx           # AI-Finance Assist Chat Widget
│   │       ├── right-chat-sidebar.tsx# Sliding Chat Drawer
│   │       ├── sidebar.tsx           # Navigation Sidebar
│   │       └── world-map.tsx         # Interactive World Map
│   └── package.json
│
└── README.md
```

---

## 🧠 Multi-Agent System

The AI backbone uses **LangGraph** to orchestrate a **Supervisor → Worker** multi-agent pattern:

```
                    ┌─────────────┐
    User Query ───▶ │  Supervisor  │ ◀─── Structured Routing
                    │ (Orchestrator)│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌────────────────┐
     │   Researcher    │       │     Quant       │
     │   (7 Tools)     │       │   (4 Tools)     │
     ├────────────────┤       ├────────────────┤
     │ • search_web    │       │ • calculator    │
     │ • asean_news    │       │ • stock_price   │
     │ • current_date  │       │ • convert_curr  │
     │ • gen_image     │       │ • calc_loan     │
     │ • gen_graph     │       └────────────────┘
     │ • tariff_info   │
     │ • tts_url       │
     └────────────────┘
```

**Security Features:**
- Prompt injection defense across all agent prompts
- Domain-confinement (financial/trade topics only)
- System instruction concealment directives
- Input length capping on tool parameters

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm** or **yarn**

### Backend (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy env and configure API keys
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)

# Run dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm run dev
```

App available at: **http://localhost:3000**

---

## 🔑 Environment Variables

Create a `.env` file in `/backend` with:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `GEMINI_MODEL` | Gemini model name (e.g. `gemini-3-flash-preview`) | ✅ |
| `TAVILY_API_KEY` | Tavily web search API key | ✅ |
| `ALPHAVANTAGE_API_KEY` | Alpha Vantage stock/forex API key | ⬚ Optional |
| `NEWS_API_KEY` | NewsAPI.org key for ASEAN headlines | ⬚ Optional |
| `MEM0_API_KEY` | Mem0 memory layer API key | ⬚ Optional |
| `SUPABASE_URL` | Supabase project URL | ⬚ Optional |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ⬚ Optional |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | ⬚ Optional |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root welcome message |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chatbot/message` | AI-Finance Assist (multi-agent) |
| `POST` | `/api/trade-ai/query` | Trade regulation Q&A (RAG) |
| `POST` | `/api/trade-ai/generate-document` | Compliance document generation |
| `POST` | `/api/trade-ai/tariff-lookup` | Tariff rate lookup |
| `POST` | `/api/credit/score` | Alternative credit scoring |
| `POST` | `/api/supply-chain/recommend-suppliers` | Supplier recommendations |
| `GET` | `/api/market/analysis` | Market analytics |
| `POST` | `/api/document-ai/process` | Document AI processing |
| `POST` | `/api/translation/translate` | Multi-language translation |
| `GET` | `/api/dashboard/summary` | Dashboard data |
| `GET` | `/api/mcp/` | MCP Server (SSE) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **UI Components** | Lucide React, Recharts, react-simple-maps, react-markdown, remark-gfm |
| **Backend** | FastAPI, Python 3.11+, Pydantic v2 |
| **AI/LLM** | Google Gemini (gemini-3-flash-preview), LangChain, LangGraph |
| **Agent Tools** | Tavily (search), Alpha Vantage (stocks), NewsAPI (news), QuickChart (graphs), Pollinations (images), ExchangeRate API (forex) |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Memory** | Mem0 (conversational memory) |
| **Protocol** | Model Context Protocol (MCP) via FastMCP |

---

## 👥 Team

Built with ❤️ for the **BorneoHack Hackathon** 🏆

---

## 📄 License

This project is for hackathon demonstration purposes.