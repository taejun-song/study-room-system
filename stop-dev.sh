#!/bin/bash

# Stop all development services

echo "🛑 Stopping Study Room System Development Environment..."

# Kill backend
if [ -f .backend.pid ]; then
  BACKEND_PID=$(cat .backend.pid)
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    kill $BACKEND_PID
    echo "✅ Backend stopped (PID: $BACKEND_PID)"
  fi
  rm .backend.pid
fi

# Kill ngrok
if [ -f .ngrok.pid ]; then
  NGROK_PID=$(cat .ngrok.pid)
  if ps -p $NGROK_PID > /dev/null 2>&1; then
    kill $NGROK_PID
    echo "✅ Ngrok stopped (PID: $NGROK_PID)"
  fi
  rm .ngrok.pid
fi

# Kill mobile app
if [ -f .mobile.pid ]; then
  MOBILE_PID=$(cat .mobile.pid)
  if ps -p $MOBILE_PID > /dev/null 2>&1; then
    kill $MOBILE_PID
    echo "✅ Mobile app stopped (PID: $MOBILE_PID)"
  fi
  rm .mobile.pid
fi

# Cleanup any remaining processes
pkill -f "ts-node-dev.*src/index.ts" 2>/dev/null && echo "✅ Cleaned up backend processes"
pkill -f "ngrok http 3001" 2>/dev/null && echo "✅ Cleaned up ngrok processes"
pkill -f "expo start" 2>/dev/null && echo "✅ Cleaned up mobile app processes"

echo "✨ All services stopped!"
