#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    # Force kill specific ports just in case
    lsof -t -i:3001 | xargs kill -9 2>/dev/null
    lsof -t -i:5173 | xargs kill -9 2>/dev/null
    echo "✅ Done."
}

# Set up trap to catch Ctrl+C (SIGINT)
trap cleanup EXIT

echo "🧹 Cleaning up any existing processes on ports 3001 and 5173..."
lsof -t -i:3001 -i:5173 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting RentalDrives System..."

# Start Backend
echo "   --> Launching Backend (Port 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "   --> Launching Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
