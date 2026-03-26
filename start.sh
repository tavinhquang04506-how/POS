#!/bin/bash

echo "Starting POS Supermarket System..."

# Start Backend
echo "Starting Backend API (Port 3000)..."
cd backend
npx ts-node src/index.ts &
BACKEND_PID=$!

# Start Frontend
echo "Starting React Frontend (Vite)..."
cd ../frontend
npm run dev -- --port 5173 --open &
FRONTEND_PID=$!

echo "====================================="
echo "Backend running on http://localhost:3000"
echo "Frontend running on http://localhost:5173"
echo "Press CTRL+C to stop both servers."
echo "====================================="

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT
wait
