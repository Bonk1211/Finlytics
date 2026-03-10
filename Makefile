.PHONY: install start stop dev

SHELL := /bin/bash

install:
	@echo "Setting up backend..."
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Setting up frontend..."
	cd frontend && npm install

start:
	@echo "=========================================================="
	@echo "Starting all services..."
	@echo "  Frontend:      http://localhost:3000"
	@echo "  Backend API:   http://localhost:8000"
	@echo "  FastMCP:       http://localhost:8080/mcp/"
	@echo "Press Ctrl+C to stop all services."
	@echo "=========================================================="
	@trap 'echo "Stopping services..."; kill 0' SIGINT; \
	(cd frontend && npm run dev) & \
	(cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000) & \
	(cd backend && source venv/bin/activate && fastmcp run app/mcp_tools:mcp --transport http --host 127.0.0.1 --port 8080 --reload) & \
	wait

dev: start

stop:
	@echo "Stopping running services..."
	-pkill -f "uvicorn app.main:app"
	-pkill -f "npm run dev"
	-pkill -f "node.*next"
	-pkill -f "fastmcp run"
	@echo "Services stopped."
