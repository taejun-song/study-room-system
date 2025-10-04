#!/bin/bash

# Get the current local IP address
IP=$(hostname -I | awk '{print $1}')

echo "🔍 Detected IP address: $IP"

# Update .env file in mobile directory
cd "$(dirname "$0")/mobile"
echo "EXPO_PUBLIC_API_URL=http://$IP:3001/api" > .env

echo "✅ Updated mobile/.env with API URL: http://$IP:3001/api"
echo ""
echo "📱 Please restart your Expo app to use the new IP address"
echo "   1. Stop the Expo server (Ctrl+C)"
echo "   2. Run: cd mobile && npx expo start"
