.PHONY: install start stop dev

SHELL := /bin/bash

install:
	@echo "Setting up backend..."
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Setting up frontend..."
	cd frontend && npm install

start:
	@echo "=========================================================="
	@echo "Starting Backend (Port 8000) and Frontend (Port 3000)..."
	@echo "Press Ctrl+C to stop all services."
	@echo "=========================================================="
	@trap 'echo "Stopping services..."; kill 0' SIGINT; \
	(cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000) & \
	(cd frontend && npm run dev) & \
	wait

dev: start

stop:
	@echo "Stopping running services..."
	-pkill -f "uvicorn app.main:app"
	-pkill -f "npm run dev"
	-pkill -f "node.*next"
	@echo "Services stopped."
