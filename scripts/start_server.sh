#!/bin/bash
set -e

echo "===== Starting Server ====="

# Ensure application directory exists
APP_DIR="/home/ec2-user/wellasset"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Run database migrations before starting server
echo "Running database migrations..."
docker run --rm \
    --env-file .env \
    wellasset-app:latest \
    npm run db:push

echo "Migrations complete"

# Start the application container
echo "Starting application container..."
docker run -d \
    --name wellasset-app \
    --restart unless-stopped \
    -p 5000:5000 \
    --env-file .env \
    --health-cmd="curl -f http://localhost:5000/health || exit 1" \
    --health-interval=30s \
    --health-timeout=5s \
    --health-retries=3 \
    --health-start-period=60s \
    wellasset-app:latest

echo "Container started"

# Wait for container to be healthy
echo "Waiting for application to be healthy..."
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker inspect --format='{{.State.Health.Status}}' wellasset-app 2>/dev/null | grep -q "healthy"; then
        echo "Application is healthy!"
        exit 0
    fi
    
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo "Waiting... (${ELAPSED}s/${TIMEOUT}s)"
done

echo "Warning: Application did not become healthy within ${TIMEOUT} seconds"
echo "Container logs:"
docker logs wellasset-app --tail 50

exit 0  # Don't fail deployment, let ValidateService check
