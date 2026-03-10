from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import health, trade_ai, document_ai, translation, inventory, credit, market, supply_chain, dashboard, mcp, chatbot

load_dotenv()

app = FastAPI(
    title="BorneoHack MSME Trade AI",
    version="0.1.0",
    description="Multi-AI service platform for MSME cross-border trade",
    lifespan=mcp.mcp_app.lifespan,
)

# --- CORS ---
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(trade_ai.router, prefix="/api")
app.include_router(document_ai.router, prefix="/api")
app.include_router(translation.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(credit.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(supply_chain.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(mcp.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Welcome to BorneoHack MSME Trade AI Platform",
        "docs": "/docs",
        "modules": [
            "Trade Regulation AI",
            "Document AI",
            "Translation",
            "Supply Chain & Inventory",
            "Predictive Market Analytics",
            "Alternative Credit Scoring",
            "MSME Dashboard",
        ],
    }
