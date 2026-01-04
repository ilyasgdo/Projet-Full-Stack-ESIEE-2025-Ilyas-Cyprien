#!/bin/bash
# =============================================================================
# Full CD Setup - One Command to Start Everything
# =============================================================================
# Run this script once to:
# 1. Start Minikube
# 2. Deploy the initial application
# 3. Start port-forward for backend
# 4. Start Cloudflare Tunnel for public access
#
# After this, the application is accessible at:
# - Local: minikube service quiz-frontend --url
# - Public: https://ilyasghandaoui.store (Frontend)
# - Public: https://api.ilyasghandaoui.store (Backend API)
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
echo -e "${YELLOW}📦 Step 1/5: Setting up Minikube...${NC}"
"$SCRIPT_DIR/setup-minikube.sh"
echo ""

# Step 2: Deploy Application
echo -e "${YELLOW}📦 Step 2/5: Deploying Application...${NC}"
export DOCKERHUB_USERNAME="ssssssss3"
"$SCRIPT_DIR/deploy.sh"
echo ""

# Step 3: Wait for pods to be ready
echo -e "${YELLOW}📦 Step 3/5: Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l component=backend --timeout=120s 2>/dev/null || true
kubectl wait --for=condition=ready pod -l component=frontend --timeout=120s 2>/dev/null || true
echo ""

# Step 4: Start port-forward for backend (background)
echo -e "${YELLOW}📦 Step 4/5: Starting port-forward for backend...${NC}"
# Kill existing port-forward if running
pkill -f "kubectl port-forward svc/quiz-backend" 2>/dev/null || true
sleep 1
# Start new port-forward in background
nohup kubectl port-forward svc/quiz-backend 5000:5000 > /tmp/port-forward.log 2>&1 &
PORT_FORWARD_PID=$!
echo -e "   ✅ Port-forward started (PID: $PORT_FORWARD_PID)"
echo -e "   📝 Logs: /tmp/port-forward.log"
echo ""

# Step 5: Start Cloudflare Tunnel (background)
echo -e "${YELLOW}📦 Step 5/5: Starting Cloudflare Tunnel...${NC}"
if command -v cloudflared &> /dev/null; then
    # Kill existing tunnel if running
    pkill -f "cloudflared tunnel run" 2>/dev/null || true
    sleep 1
    # Start tunnel in background
    nohup cloudflared tunnel run quiz-backend > /tmp/cloudflared.log 2>&1 &
    TUNNEL_PID=$!
    echo -e "   ✅ Cloudflare tunnel started (PID: $TUNNEL_PID)"
    echo -e "   📝 Logs: /tmp/cloudflared.log"
else
    echo -e "   ${RED}⚠️  cloudflared not installed${NC}"
    echo -e "   Install with: brew install cloudflared"
fi
echo ""

# Get Access URLs
FRONTEND_URL=$(minikube service quiz-frontend --url 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ SETUP COMPLETE                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🌐 Application URLs:${NC}"
if [ -n "$FRONTEND_URL" ]; then
    echo -e "   Local:  ${GREEN}$FRONTEND_URL${NC}"
fi
echo -e "   Public: ${GREEN}https://ilyasghandaoui.store${NC} (Frontend)"
echo -e "   API:    ${GREEN}https://api.ilyasghandaoui.store${NC} (Backend)"
echo ""

echo -e "${BLUE}📝 Workflow:${NC}"
echo "   1. git push origin master    → Triggers GitHub Actions"
echo "   2. GitHub Actions            → Builds & pushes Docker images"
echo "   3. Minikube auto-updates     → New pods with latest images"
echo ""

echo -e "${YELLOW}🔄 Background Services:${NC}"
echo "   Port-forward: kubectl port-forward svc/quiz-backend 5000:5000"
echo "   Tunnel:       cloudflared tunnel run quiz-backend"
echo ""

echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "   kubectl get pods -l app=quiz        - Show pods status"
echo "   kubectl logs -l component=backend   - Backend logs"
echo "   tail -f /tmp/cloudflared.log        - Tunnel logs"
echo "   minikube dashboard                  - Open K8s dashboard"
echo ""

echo -e "${YELLOW}🛑 To stop services:${NC}"
echo "   pkill -f 'kubectl port-forward'     - Stop port-forward"
echo "   pkill -f 'cloudflared tunnel'       - Stop tunnel"
echo ""
