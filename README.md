# BorneoHack

A full-stack monorepo with **FastAPI** (Python backend) and **Next.js** (TypeScript frontend).

## Project Structure

```
BorneoHack/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   └── routers/
│   │       └── health.py   # Health-check endpoint
│   ├── venv/               # Python virtual environment (git-ignored)
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # Next.js frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Getting Started

### Backend (FastAPI)

```bash
cd backend
# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy env and edit as needed
cp .env.example .env

# Run dev server
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint     | Description        |
|--------|--------------|--------------------|
| GET    | `/`          | Root welcome msg   |
| GET    | `/api/health`| Health check       |