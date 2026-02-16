#!/bin/bash

# Script to add all environment variables to Vercel
# Run this from the project root: ./scripts/add-vercel-env.sh

PROJECT_NAME="voice-ai-platform"
SCOPE="kyles-projects-84986792"

echo "🚀 Adding environment variables to Vercel project: $PROJECT_NAME"
echo ""

# Function to add env var
add_env() {
  local key=$1
  local value=$2
  local target=${3:-production}

  echo "Adding: $key"
  echo "$value" | vercel env add "$key" "$target" --scope "$SCOPE" --yes 2>&1 | grep -v "warning"
}

# Database & Auth
echo "📊 Adding Database & Auth variables..."
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://qoendwnzpsmztgonrxzq.supabase.co"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTQxMzAsImV4cCI6MjA4NjUzMDEzMH0.WBxPzqXWeuFqzfPKzyAkpNVtqiY_vkSBKk1FZy7zg5A"
add_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE"

# AI Services
echo ""
echo "🤖 Adding AI service keys..."
add_env "ANTHROPIC_API_KEY" "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"
add_env "RETELL_API_KEY" "key_85da79d1d9da73aee899af323f23"
add_env "ELEVENLABS_API_KEY" "sk_0e17edf6e4a0654b3fdb050aa6c57e7d46c908eab8ebc0e0"

# Email
echo ""
echo "📧 Adding email service keys..."
add_env "RESEND_API_KEY" "re_DHwg8EqA_KYnk1DomdH59bF4Ui84kuTtL"
add_env "RESEND_FROM_EMAIL" "onboarding@resend.dev"

# Cron Security
echo ""
echo "🔒 Adding cron secret..."
add_env "CRON_SECRET" "6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d"

# Other
echo ""
echo "🔧 Adding other variables..."
add_env "RENTCAST_API_KEY" "514bcf62f55c4673a73e4abca99e281c"
add_env "GOOGLE_CLIENT_ID" "your-google-client-id"
add_env "GOOGLE_CLIENT_SECRET" "your-google-client-secret"
add_env "CALENDLY_CLIENT_ID" "your-calendly-client-id"
add_env "CALENDLY_CLIENT_SECRET" "your-calendly-client-secret"
add_env "GHL_CLIENT_ID" "your-ghl-client-id"
add_env "GHL_CLIENT_SECRET" "your-ghl-client-secret"

echo ""
echo "✅ All environment variables added!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod --scope $SCOPE"
echo "2. Update NEXT_PUBLIC_APP_URL with production URL"
echo "3. Run migration: https://your-app.vercel.app/api/admin/migrate-email-prefs"
echo ""
