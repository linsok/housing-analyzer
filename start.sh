#!/bin/bash

echo "========================================"
echo "Housing & Rent Analyzer"
echo "Starting Development Servers"
echo "========================================"
echo ""

echo "Starting Backend Server..."
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Servers are running..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
