#!/bin/bash

# Script to update the API URL in config.ts
# Usage: ./update-api-url.sh <new-ngrok-url>

if [ -z "$1" ]; then
  echo "Usage: ./update-api-url.sh <ngrok-url>"
  echo "Example: ./update-api-url.sh https://abc-123.ngrok-free.dev"
  exit 1
fi

NEW_URL="$1/api"
CONFIG_FILE="config.ts"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: $CONFIG_FILE not found"
  exit 1
fi

# Read the file, update the URL, and write it back
sed -i "s|BASE_URL: '.*'|BASE_URL: '$NEW_URL'|" "$CONFIG_FILE"

echo "✅ Updated API URL to: $NEW_URL"
echo "📱 Reload your Expo app to apply changes"
