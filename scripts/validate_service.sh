#!/bin/bash
set -e

echo "===== Validating Service ====="

# Check if container is running
if ! docker ps -q -f name=wellasset-app | grep -q .; then
    echo "ERROR: Container is not running"
    docker logs wellasset-app --tail 100
    exit 1
fi

echo "Container is running"

# Check container health
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' wellasset-app 2>/dev/null || echo "none")
echo "Container health status: ${HEALTH_STATUS}"

# Wait up to 60 seconds for health check to pass
TIMEOUT=60
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Try to curl the health endpoint
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✓ Health check endpoint responding"
        
        # Verify the response
        RESPONSE=$(curl -s http://localhost:5000/health)
        echo "Health response: ${RESPONSE}"
        
        if echo "$RESPONSE" | grep -q '"status":"ok"'; then
            echo "✓ Service validation successful"
            exit 0
        fi
    fi
    
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo "Waiting for health check... (${ELAPSED}s/${TIMEOUT}s)"
done

echo "ERROR: Service validation failed - health check timeout"
echo "Container status:"
docker ps -a -f name=wellasset-app
echo ""
echo "Container logs:"
docker logs wellasset-app --tail 100

exit 1
