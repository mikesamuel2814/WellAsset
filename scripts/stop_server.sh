#!/bin/bash
set -e

echo "===== Stopping Server ====="

cd /home/ec2-user/wellasset

# Check if container is running
if docker ps -q -f name=wellasset-app | grep -q .; then
    echo "Stopping existing container..."
    docker stop wellasset-app || true
    docker rm wellasset-app || true
    echo "Container stopped"
else
    echo "No running container found"
fi

echo "Server stop complete"
