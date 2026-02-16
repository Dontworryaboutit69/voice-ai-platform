#!/bin/bash

# Deployment Status Checker
# Run after deployment to verify everything is working

echo "🔍 Checking Voice AI Platform Deployment Status"
echo "================================================"
echo ""

# Get production URL from user
echo "Enter your production URL (e.g., https://voice-ai-platform.vercel.app):"
read PROD_URL

if [ -z "$PROD_URL" ]; then
  echo "❌ No URL provided. Exiting."
  exit 1
fi

echo ""
echo "Testing: $PROD_URL"
echo ""

# Test 1: Webhook endpoint
echo "1️⃣ Testing webhook endpoint..."
WEBHOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/webhooks/retell/call-events")
if [ "$WEBHOOK_STATUS" = "200" ]; then
  echo "   ✅ Webhook endpoint responding (HTTP $WEBHOOK_STATUS)"
else
  echo "   ❌ Webhook endpoint failed (HTTP $WEBHOOK_STATUS)"
fi
echo ""

# Test 2: Database migration
echo "2️⃣ Testing database migration..."
MIGRATION_RESPONSE=$(curl -s -X POST "$PROD_URL/api/admin/migrate-email-prefs")
MIGRATION_SUCCESS=$(echo $MIGRATION_RESPONSE | grep -o '"success":true')
if [ -n "$MIGRATION_SUCCESS" ]; then
  echo "   ✅ Migration endpoint working"
  echo "   Response: $MIGRATION_RESPONSE"
else
  echo "   ⚠️  Migration response: $MIGRATION_RESPONSE"
fi
echo ""

# Test 3: Email test endpoint
echo "3️⃣ Testing email system..."
echo "   Enter your email for test:"
read TEST_EMAIL

if [ -n "$TEST_EMAIL" ]; then
  EMAIL_RESPONSE=$(curl -s "$PROD_URL/api/test/email?type=message_taken&testEmail=$TEST_EMAIL")
  EMAIL_SUCCESS=$(echo $EMAIL_RESPONSE | grep -o '"success":true')
  if [ -n "$EMAIL_SUCCESS" ]; then
    echo "   ✅ Test email sent to $TEST_EMAIL"
    echo "   Check your inbox!"
  else
    echo "   ❌ Email test failed"
    echo "   Response: $EMAIL_RESPONSE"
  fi
else
  echo "   ⏭️  Skipped email test"
fi
echo ""

# Test 4: Cron endpoint (requires CRON_SECRET)
echo "4️⃣ Testing cron job endpoint..."
echo "   Enter CRON_SECRET (or skip):"
read CRON_SECRET

if [ -n "$CRON_SECRET" ]; then
  CRON_RESPONSE=$(curl -s -H "Authorization: Bearer $CRON_SECRET" "$PROD_URL/api/cron/daily-summary")
  CRON_SUCCESS=$(echo $CRON_RESPONSE | grep -o '"success":true')
  if [ -n "$CRON_SUCCESS" ]; then
    echo "   ✅ Cron job endpoint working"
    echo "   Response: $CRON_RESPONSE"
  else
    echo "   ⚠️  Cron job response: $CRON_RESPONSE"
  fi
else
  echo "   ⏭️  Skipped cron test"
fi
echo ""

# Test 5: Check Vercel deployment
echo "5️⃣ Checking Vercel deployment status..."
VERCEL_STATUS=$(vercel ls --scope kyles-projects-84986792 2>&1 | grep -i "voice-ai-platform")
if [ -n "$VERCEL_STATUS" ]; then
  echo "   ✅ Project found in Vercel"
  echo "$VERCEL_STATUS"
else
  echo "   ❌ Project not found in Vercel"
fi
echo ""

# Summary
echo "================================================"
echo "📊 Deployment Check Summary"
echo "================================================"
echo ""
echo "✅ = Working | ❌ = Failed | ⚠️ = Needs Review | ⏭️ = Skipped"
echo ""
echo "Next Steps:"
echo "1. If any tests failed, check Vercel logs:"
echo "   vercel logs --scope kyles-projects-84986792"
echo ""
echo "2. Check environment variables in Vercel dashboard"
echo ""
echo "3. Update Retell webhook URLs to:"
echo "   $PROD_URL/api/webhooks/retell/call-events"
echo ""
echo "4. Monitor email delivery in Resend:"
echo "   https://resend.com/emails"
echo ""
echo "5. Check cron job schedule in Vercel:"
echo "   https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/cron-jobs"
echo ""
