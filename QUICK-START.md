# Quick Start - Deploy to Vercel

## Option 1: Automated Setup (Recommended)

Run this script to add all environment variables at once:

```bash
cd /Users/kylekotecha/Desktop/voice-ai-platform
./scripts/add-vercel-env.sh
```

Then deploy:

```bash
vercel --prod --scope kyles-projects-84986792
```

---

## Option 2: Manual Setup via Dashboard

### 1. Go to Vercel
https://vercel.com/kyles-projects-84986792

### 2. Import Project
- Click "Add New Project"
- Import `voice-ai-platform` from GitHub

### 3. Add Environment Variables
Go to: Project Settings > Environment Variables

Copy-paste these (all at once):

```env
NEXT_PUBLIC_SUPABASE_URL=https://qoendwnzpsmztgonrxzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTQxMzAsImV4cCI6MjA4NjUzMDEzMH0.WBxPzqXWeuFqzfPKzyAkpNVtqiY_vkSBKk1FZy7zg5A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE
ANTHROPIC_API_KEY=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
RETELL_API_KEY=key_85da79d1d9da73aee899af323f23
ELEVENLABS_API_KEY=sk_0e17edf6e4a0654b3fdb050aa6c57e7d46c908eab8ebc0e0
RESEND_API_KEY=re_DHwg8EqA_KYnk1DomdH59bF4Ui84kuTtL
RESEND_FROM_EMAIL=onboarding@resend.dev
CRON_SECRET=6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d
RENTCAST_API_KEY=514bcf62f55c4673a73e4abca99e281c
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALENDLY_CLIENT_ID=your-calendly-client-id
CALENDLY_CLIENT_SECRET=your-calendly-client-secret
GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
```

### 4. Deploy
Click "Deploy"

---

## After Deployment

### 1. Get Production URL
```
https://voice-ai-platform-xyz.vercel.app
```

### 2. Run Database Migration
Visit this URL in your browser:
```
https://your-app.vercel.app/api/admin/migrate-email-prefs
```

You should see:
```json
{
  "success": true,
  "message": "Email preferences columns added successfully"
}
```

### 3. Test Email System
```
https://your-app.vercel.app/api/test/email?type=message_taken&testEmail=kyle@leadlabsplus.com
```

### 4. Update Retell Webhooks
In Retell dashboard, update webhook URL for each agent:
```
https://your-app.vercel.app/api/webhooks/retell/call-events
```

### 5. Verify Cron Job
- Go to Vercel Dashboard > Cron Jobs
- Confirm `daily-summary` is listed
- Schedule: `0 9 * * *` (9:00 AM UTC)

---

## Testing Checklist

- [ ] Deployment successful (check Vercel dashboard)
- [ ] Migration ran (visit /api/admin/migrate-email-prefs)
- [ ] Test emails work (visit /api/test/email?type=...)
- [ ] Webhook endpoint responds (GET /api/webhooks/retell/call-events)
- [ ] Cron job scheduled (visible in Vercel dashboard)
- [ ] Production URL updated in Retell agents

---

## What's Deployed

### ✅ Email Notifications
- **Message Taken**: Auto-sends when customer leaves callback info
- **Appointment Booked**: Auto-sends when appointment scheduled
- **Daily Summary**: Sends at 9am UTC if calls occurred yesterday

### ✅ Email Preferences
Each agent has toggles for:
- Master enable/disable
- Message taken notifications
- Appointment booked notifications
- Daily summary emails

### ✅ Cron Job
- Runs daily at 9:00 AM UTC
- Only sends summary if agent had calls in last 24 hours
- Respects email preferences

### ✅ Webhooks
- Analyzes call transcripts
- Extracts customer info (name, phone, email)
- Determines outcome (message vs appointment)
- Sends appropriate notification

---

## Support

### View Logs
```bash
vercel logs --scope kyles-projects-84986792
```

### Check Email Delivery
https://resend.com/emails

### Manual Cron Trigger (for testing)
```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-summary" \
  -H "Authorization: Bearer 6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d"
```

---

## Email Domain Setup (Later)

Currently using `onboarding@resend.dev` which works immediately.

When ready to use custom domain:

1. Go to https://resend.com/domains
2. Add your domain
3. Add DNS records
4. Update Vercel env var:
   ```
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   ```
5. Redeploy
