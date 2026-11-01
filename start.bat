@echo off
title Road Defect Detection - Server Launcher
echo ====================================================
echo Starting Road Defect Detection System
echo ====================================================

echo [1/3] Starting ML Service (FastAPI) on port 8000...
start "1. ML Service (Python)" cmd /k "cd mlService && python run.py"

echo [2/3] Starting Backend API (Node.js) on port 5000...
start "2. Backend API (Express)" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Frontend (React) on port 5173...
start "3. Frontend UI (React + Vite)" cmd /k "cd frontend && npm run dev"

echo ====================================================
echo All servers launched in separate windows!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:5000/api/health
echo - ML Docs:   http://localhost:8000/docs
echo ====================================================
