#!/bin/bash
# =============================================================================
# Kubernetes Deployment Script for Quiz Application
# =============================================================================
# This script deploys the Quiz application to a local Minikube cluster
# =============================================================================

set -e

echo "🚀 Quiz Application Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
K8S_DIR="$PROJECT_ROOT/k8s"

# Check if minikube is running
echo -e "${YELLOW}🔍 Checking Minikube status...${NC}"
MINIKUBE_STATUS=$(minikube status --format='{{.Host}}' 2>/dev/null || echo "None")

if [ "$MINIKUBE_STATUS" != "Running" ]; then
    echo -e "${RED}❌ Minikube is not running!${NC}"
    echo "Please run: ./scripts/setup-minikube.sh first"
    exit 1
fi

echo -e "${GREEN}✅ Minikube is running${NC}"

# Check if Docker Hub username is set
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo -e "${YELLOW}⚠️  DOCKERHUB_USERNAME environment variable not set${NC}"
    read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME
    
    if [ -z "$DOCKERHUB_USERNAME" ]; then
        echo -e "${RED}❌ Docker Hub username is required${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📦 Using Docker Hub username: $DOCKERHUB_USERNAME${NC}"

# Update deployment files with Docker Hub username
echo -e "${YELLOW}🔧 Updating Kubernetes manifests with Docker Hub username...${NC}"

# Create temp directory for modified manifests
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy and modify manifests
cp "$K8S_DIR"/*.yaml "$TEMP_DIR/"

# Replace placeholder with actual Docker Hub username
sed -i.bak "s/YOUR_DOCKERHUB_USERNAME/$DOCKERHUB_USERNAME/g" "$TEMP_DIR"/*.yaml
rm -f "$TEMP_DIR"/*.bak

# Apply Kubernetes manifests in order
echo -e "${YELLOW}📦 Applying Kubernetes manifests...${NC}"

echo "  → Applying ConfigMap..."
kubectl apply -f "$TEMP_DIR/configmap.yaml"

echo "  → Applying Secrets..."
kubectl apply -f "$TEMP_DIR/secrets.yaml"

echo "  → Applying Backend Deployment..."
kubectl apply -f "$TEMP_DIR/backend-deployment.yaml"

echo "  → Applying Frontend Deployment..."
kubectl apply -f "$TEMP_DIR/frontend-deployment.yaml"

# Wait for deployments to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"

echo "  → Waiting for backend..."
kubectl rollout status deployment/quiz-backend --timeout=120s

echo "  → Waiting for frontend..."
kubectl rollout status deployment/quiz-frontend --timeout=120s

# Get service URLs
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Show pod status
echo -e "${BLUE}📊 Pod Status:${NC}"
kubectl get pods -l app=quiz

echo ""
echo -e "${BLUE}🌐 Services:${NC}"
kubectl get services -l app=quiz

echo ""
echo -e "${YELLOW}🔗 Access the application:${NC}"

# Get frontend URL using minikube
FRONTEND_URL=$(minikube service quiz-frontend --url 2>/dev/null || echo "")

if [ -n "$FRONTEND_URL" ]; then
    echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
else
    echo "  Run: minikube service quiz-frontend --url"
fi

echo ""
echo "Useful commands:"
echo "  kubectl get pods -l app=quiz      - Show all quiz pods"
echo "  kubectl logs -l component=backend - View backend logs"
echo "  kubectl logs -l component=frontend - View frontend logs"
echo "  minikube dashboard                 - Open Kubernetes dashboard"
