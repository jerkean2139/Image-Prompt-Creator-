#!/bin/bash
# Runtz AI Production Start Script

echo "🚀 Starting Runtz AI Image Maker..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Start services
echo "✅ Starting services..."

# Start API server
node server/index.js &
API_PID=$!
echo "API Server started (PID: $API_PID)"

# Start worker
node server/worker.js &
WORKER_PID=$!
echo "Worker started (PID: $WORKER_PID)"

# Serve frontend
npx serve -s dist -l 5173 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo "✅ All services started!"
echo "API: http://localhost:3000"
echo "Frontend: http://localhost:5173"

# Wait for all processes
wait
