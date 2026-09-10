#!/bin/bash
set -e

# Railway's private network (postgres.railway.internal) is only available at
# runtime, and takes a moment to initialise after the container starts. Migrations
# therefore run here, not during the build, and retry while DNS comes up.
echo "🔄 Running database migrations..."
ATTEMPT=1
MAX_ATTEMPTS=5
until npx prisma migrate deploy; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "❌ Migrations failed after $MAX_ATTEMPTS attempts. Check DATABASE_URL."
    exit 1
  fi
  DELAY=$((ATTEMPT * 3))
  echo "⏳ Migration attempt $ATTEMPT failed, retrying in ${DELAY}s..."
  sleep "$DELAY"
  ATTEMPT=$((ATTEMPT + 1))
done

if [ -n "$REDIS_URL" ]; then
  echo "🚀 Starting worker in background..."
  node server/worker.js &
else
  echo "⚠️  REDIS_URL not set - skipping worker. Image generation jobs will not process."
fi

echo "🚀 Starting server..."
node server/index.js
