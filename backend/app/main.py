from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import health

load_dotenv()

app = FastAPI(
    title="BorneoHack API",
    version="0.1.0",
    description="FastAPI backend for BorneoHack",
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


@app.get("/")
async def root():
    return {"message": "Welcome to BorneoHack API"}
