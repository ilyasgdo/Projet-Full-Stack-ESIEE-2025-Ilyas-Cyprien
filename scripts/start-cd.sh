#!/bin/bash
# =============================================================================
# Full CD Setup - One Command to Start Everything
# =============================================================================
# Run this script once to:
# 1. Start Minikube
# 2. Deploy the initial application
# 3. Start the auto-deploy watcher
#
# After this, every push to master will automatically:
# - Trigger GitHub Actions CI/CD
# - Build and push new Docker images
# - Auto-deploy to Minikube (through the watcher)
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║      🚀 Quiz App - Full Continuous Deployment Setup       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Setup Minikube
echo -e "${YELLOW}📦 Step 1/3: Setting up Minikube...${NC}"
"$SCRIPT_DIR/setup-minikube.sh"
echo ""

# Step 2: Deploy Application
echo -e "${YELLOW}📦 Step 2/3: Deploying Application...${NC}"
export DOCKERHUB_USERNAME="ssssssss3"
"$SCRIPT_DIR/deploy.sh"
echo ""

# Step 3: Get Access URL
echo -e "${YELLOW}📦 Step 3/3: Getting Access Information...${NC}"
FRONTEND_URL=$(minikube service quiz-frontend --url 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ SETUP COMPLETE                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$FRONTEND_URL" ]; then
    echo -e "🌐 Application URL: ${GREEN}$FRONTEND_URL${NC}"
else
    echo "🌐 To get the URL, run: minikube service quiz-frontend --url"
fi

echo ""
echo -e "${BLUE}📝 Workflow:${NC}"
echo "   1. git push origin master    → Triggers GitHub Actions"
echo "   2. GitHub Actions            → Builds & pushes Docker images"
echo "   3. Minikube auto-updates     → New pods with latest images"
echo ""
echo -e "${YELLOW}🔄 To enable auto-deploy watcher (in a new terminal):${NC}"
echo "   ./scripts/auto-deploy.sh"
echo ""
echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "   kubectl get pods -l app=quiz        - Show pods status"
echo "   kubectl rollout restart deployment/quiz-backend  - Manual redeploy backend"
echo "   kubectl rollout restart deployment/quiz-frontend - Manual redeploy frontend"
echo "   minikube dashboard                  - Open K8s dashboard"
echo ""
