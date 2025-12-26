#!/bin/bash
# =============================================================================
# Auto-Deploy Watcher for Minikube
# =============================================================================
# This script monitors Docker Hub for new images and automatically
# updates the deployments in Minikube
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-ssssssss3}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"  # Check every 60 seconds

echo -e "${BLUE}🔄 Auto-Deploy Watcher for Minikube${NC}"
echo "================================================"
echo "Docker Hub Username: $DOCKERHUB_USERNAME"
echo "Check Interval: ${CHECK_INTERVAL}s"
echo "================================================"
echo ""

# Function to get the latest digest from Docker Hub
get_docker_hub_digest() {
    local image=$1
    curl -s "https://hub.docker.com/v2/repositories/${DOCKERHUB_USERNAME}/${image}/tags/latest" 2>/dev/null | \
        grep -o '"digest":"[^"]*"' | head -1 | cut -d'"' -f4 || echo ""
}

# Function to get the current digest in Kubernetes
get_k8s_image_digest() {
    local deployment=$1
    kubectl get deployment "$deployment" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo ""
}

# Function to restart a deployment
restart_deployment() {
    local deployment=$1
    echo -e "${YELLOW}🔄 Restarting deployment: $deployment${NC}"
    kubectl rollout restart deployment/"$deployment"
    kubectl rollout status deployment/"$deployment" --timeout=120s
    echo -e "${GREEN}✅ Deployment $deployment updated successfully${NC}"
}

# Check if minikube is running
MINIKUBE_STATUS=$(minikube status --format='{{.Host}}' 2>/dev/null || echo "None")
if [ "$MINIKUBE_STATUS" != "Running" ]; then
    echo -e "${RED}❌ Minikube is not running!${NC}"
    echo "Please run: ./scripts/setup-minikube.sh first"
    exit 1
fi

echo -e "${GREEN}✅ Minikube is running${NC}"
echo ""

# Store last known digests
LAST_BACKEND_DIGEST=""
LAST_FRONTEND_DIGEST=""

echo -e "${BLUE}👀 Watching for new images... (Ctrl+C to stop)${NC}"
echo ""

while true; do
    # Get current digests from Docker Hub
    CURRENT_BACKEND_DIGEST=$(get_docker_hub_digest "quiz-api")
    CURRENT_FRONTEND_DIGEST=$(get_docker_hub_digest "quiz-ui")
    
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check backend
    if [ -n "$CURRENT_BACKEND_DIGEST" ] && [ "$CURRENT_BACKEND_DIGEST" != "$LAST_BACKEND_DIGEST" ]; then
        if [ -n "$LAST_BACKEND_DIGEST" ]; then
            echo -e "[$TIMESTAMP] ${GREEN}🆕 New backend image detected!${NC}"
            restart_deployment "quiz-backend"
        else
            echo -e "[$TIMESTAMP] ${BLUE}📦 Backend digest initialized${NC}"
        fi
        LAST_BACKEND_DIGEST="$CURRENT_BACKEND_DIGEST"
    fi
    
    # Check frontend
    if [ -n "$CURRENT_FRONTEND_DIGEST" ] && [ "$CURRENT_FRONTEND_DIGEST" != "$LAST_FRONTEND_DIGEST" ]; then
        if [ -n "$LAST_FRONTEND_DIGEST" ]; then
            echo -e "[$TIMESTAMP] ${GREEN}🆕 New frontend image detected!${NC}"
            restart_deployment "quiz-frontend"
        else
            echo -e "[$TIMESTAMP] ${BLUE}📦 Frontend digest initialized${NC}"
        fi
        LAST_FRONTEND_DIGEST="$CURRENT_FRONTEND_DIGEST"
    fi
    
    sleep "$CHECK_INTERVAL"
done
