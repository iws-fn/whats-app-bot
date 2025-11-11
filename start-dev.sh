#!/bin/bash

# Start Development Environment
echo "🚀 Starting WhatsApp Bot Development Environment..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for pnpm
if ! command_exists pnpm; then
    echo "❌ Error: pnpm is not installed"
    echo "📦 Install pnpm: npm install -g pnpm"
    exit 1
fi

# Check for node
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "✅ Prerequisites checked"

# Install dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && pnpm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && pnpm install && cd ..
fi

# Install Chromium for Puppeteer
echo "🌐 Installing Chromium for Puppeteer..."
cd backend && node node_modules/puppeteer/install.mjs && cd ..

# Start backend in background
echo "🔧 Starting backend server on port 3004..."
cd backend && pnpm run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend server on port 5173..."
cd frontend && pnpm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "📱 Backend: http://localhost:3004"
echo "🖥️  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo '\n🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait


щлу