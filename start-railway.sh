#!/bin/bash
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🚀 Starting worker in background..."
node server/worker.js &
echo "🚀 Starting server..."
node server/index.js
