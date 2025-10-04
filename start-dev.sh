#!/bin/bash

# Development startup script for Study Room System
# Starts backend server, ngrok tunnel, and mobile app

set -e

echo "🚀 Starting Study Room System Development Environment"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
  cd backend && npm install && cd ..
fi

# Check if mobile dependencies are installed
if [ ! -d "mobile/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing mobile dependencies...${NC}"
  cd mobile && npm install && cd ..
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
  echo -e "${YELLOW}⚠️  PostgreSQL is not running. Please start it first.${NC}"
  exit 1
fi

# Start backend server in background
echo -e "${BLUE}🔧 Starting backend server on port 3001...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Backend might not be ready yet. Check backend.log for details.${NC}"
fi

# Start ngrok tunnel
echo -e "${BLUE}🌐 Starting ngrok tunnel...${NC}"
./ngrok http 3001 > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to be ready
sleep 2

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
  echo -e "${YELLOW}⚠️  Could not get ngrok URL. Check ngrok.log${NC}"
  echo -e "${YELLOW}💡 Manually get the URL from: http://localhost:4040${NC}"
else
  echo -e "${GREEN}✅ Ngrok URL: $NGROK_URL${NC}"

  # Update mobile config if it exists
  if [ -f "mobile/config.ts" ]; then
    echo -e "${BLUE}📱 Updating mobile API configuration...${NC}"
    sed -i "s|BASE_URL: '.*'|BASE_URL: '$NGROK_URL/api'|" mobile/config.ts
    echo -e "${GREEN}✅ Mobile config updated!${NC}"
  fi
fi

# Save PIDs for cleanup
echo $BACKEND_PID > .backend.pid
echo $NGROK_PID > .ngrok.pid

echo ""
echo -e "${GREEN}=================================================="
echo -e "✅ Development environment is running!"
echo -e "==================================================${NC}"
echo ""
echo -e "${BLUE}Backend:${NC} http://localhost:3001"
echo -e "${BLUE}Ngrok URL:${NC} $NGROK_URL"
echo -e "${BLUE}Ngrok Dashboard:${NC} http://localhost:4040"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "  Backend: tail -f backend.log"
echo -e "  Ngrok: tail -f ngrok.log"
echo ""
echo -e "${YELLOW}🛑 To stop all services, run:${NC} ./stop-dev.sh"
echo ""
echo -e "${GREEN}📱 Starting mobile app with QR code...${NC}"
echo ""

# Start mobile app (Expo) with tunnel for external access - keep in foreground to show QR
cd mobile
npx expo start --tunnel
