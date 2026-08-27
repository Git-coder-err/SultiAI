#!/bin/bash
# Helper script to add Google OAuth Client ID to .env
# Usage: ./scripts/setup-google-oauth.sh YOUR_WEB_CLIENT_ID.apps.googleusercontent.com

CLIENT_ID="${1}"

if [ -z "$CLIENT_ID" ]; then
  echo "Usage: ./scripts/setup-google-oauth.sh YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
  echo ""
  echo "Steps:"
  echo "1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials"
  echo "2. Copy the Web Client ID"
  echo "3. Run this script with the Client ID"
  exit 1
fi

# Update .env file
if grep -q "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" .env; then
  # Replace existing line
  sed -i "s|EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=.*|EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=$CLIENT_ID|" .env
  echo "✅ Updated EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env"
else
  # Add new line
  echo "" >> .env
  echo "# Google OAuth" >> .env
  echo "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=$CLIENT_ID" >> .env
  echo "✅ Added EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env"
fi

echo ""
echo "Current .env Google config:"
grep "GOOGLE" .env 2>/dev/null || echo "  (none)"
echo ""
echo "Restart your app with: npm run dev"
