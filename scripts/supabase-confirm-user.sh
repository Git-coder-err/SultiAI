#!/bin/bash
# Helper script to create a confirmed user in Supabase (development only)
# Usage: ./scripts/supabase-confirm-user.sh email password "Full Name"

SUPABASE_URL="https://pptanwtuybivlqeyntwh.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFud3R1eWJpdmxxZXludHdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzYyNTAyMywiZXhwIjoyMTAzMjAxMDIzfQ.A6sAA3pj1elAl69uRbamuSfjnA5ImwgqsGTQaHYlCzQ"

EMAIL="${1:-dev@sultiai.app}"
PASSWORD="${2:-password123}"
FULL_NAME="${3:-Dev User}"

echo "Creating confirmed user: $EMAIL"

RESULT=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"full_name\":\"$FULL_NAME\"}}")

if echo "$RESULT" | grep -q '"id"'; then
  USER_ID=$(echo "$RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ User created and confirmed!"
  echo "   Email: $EMAIL"
  echo "   User ID: $USER_ID"
  echo ""
  echo "You can now sign in with these credentials in the app."
else
  echo "❌ Failed to create user:"
  echo "$RESULT"
fi
