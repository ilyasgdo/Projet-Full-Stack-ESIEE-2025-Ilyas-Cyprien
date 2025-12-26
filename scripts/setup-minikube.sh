#!/bin/bash
# =============================================================================
# Minikube Setup Script for M4 Mac
# =============================================================================
# This script sets up Minikube with optimal settings for Apple Silicon M4 Mac
# with 16GB RAM
# =============================================================================

set -e

echo "🚀 Minikube Setup for M4 Mac"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${RED}❌ Homebrew is not installed. Please install it first:${NC}"
    echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    exit 1
fi

# Check and install minikube
if ! command -v minikube &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Minikube...${NC}"
    brew install minikube
else
    echo -e "${GREEN}✅ Minikube already installed: $(minikube version --short)${NC}"
fi

# Check and install kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}📦 Installing kubectl...${NC}"
    brew install kubectl
else
    echo -e "${GREEN}✅ kubectl already installed: $(kubectl version --client --short 2>/dev/null || kubectl version --client)${NC}"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check current minikube status
MINIKUBE_STATUS=$(minikube status --format='{{.Host}}' 2>/dev/null || echo "None")

if [ "$MINIKUBE_STATUS" == "Running" ]; then
    echo -e "${GREEN}✅ Minikube is already running${NC}"
    minikube status
else
    echo -e "${YELLOW}🔧 Starting Minikube cluster...${NC}"
    echo "Configuration:"
    echo "  - Driver: docker"
    echo "  - Memory: 4096MB (4GB)"
    echo "  - CPUs: 2"
    echo ""
    
    # Start minikube with optimized settings for M4 Mac
    minikube start \
        --driver=docker \
        --memory=4096 \
        --cpus=2 \
        --disk-size=20g \
        --kubernetes-version=stable
fi

# Enable useful addons
echo -e "${YELLOW}🔌 Enabling addons...${NC}"
minikube addons enable metrics-server
minikube addons enable dashboard

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ Minikube setup complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "Useful commands:"
echo "  minikube status        - Check cluster status"
echo "  minikube dashboard     - Open Kubernetes dashboard"
echo "  minikube stop          - Stop the cluster"
echo "  minikube delete        - Delete the cluster"
echo ""
echo "Next step: Run ./scripts/deploy.sh to deploy the application"
