# Deployment Guide - Voice AI Platform

## Prerequisites
- Vercel account linked to `kyles-projects-84986792` team
- All environment variables ready (see below)

## Step 1: Add Environment Variables to Vercel

Go to your Vercel project settings: https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/environment-variables

Add these variables (copy-paste each one):

### Database & Authentication
```
NEXT_PUBLIC_SUPABASE_URL=https://qoendwnzpsmztgonrxzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTQxMzAsImV4cCI6MjA4NjUzMDEzMH0.WBxPzqXWeuFqzfPKzyAkpNVtqiY_vkSBKk1FZy7zg5A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE
```

### AI Services
```
ANTHROPIC_API_KEY=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
RETELL_API_KEY=key_85da79d1d9da73aee899af323f23
ELEVENLABS_API_KEY=sk_0e17edf6e4a0654b3fdb050aa6c57e7d46c908eab8ebc0e0
```

### Email Service
```
RESEND_API_KEY=re_DHwg8EqA_KYnk1DomdH59bF4Ui84kuTtL
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Cron Job Security
```
CRON_SECRET=6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d
```

### Application URL (will auto-populate on deploy)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### OAuth (Placeholders - Update Later)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALENDLY_CLIENT_ID=your-calendly-client-id
CALENDLY_CLIENT_SECRET=your-calendly-client-secret
GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
RENTCAST_API_KEY=514bcf62f55c4673a73e4abca99e281c
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub: `voice-ai-platform`
4. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. Click "Deploy"

### Option B: Deploy via CLI (Terminal)
```bash
cd /Users/kylekotecha/Desktop/voice-ai-platform
vercel --prod --scope kyles-projects-84986792
```

---

## Step 3: Run Database Migrations

After deployment, run this in your browser:

```
https://your-app.vercel.app/api/admin/migrate-email-prefs
```

This will add email preference columns to the agents table.

---

## Step 4: Test Email Notifications

### Test Individual Emails
```
https://your-app.vercel.app/api/test/email?type=message_taken&testEmail=kyle@leadlabsplus.com
https://your-app.vercel.app/api/test/email?type=appointment_booked&testEmail=kyle@leadlabsplus.com
https://your-app.vercel.app/api/test/email?type=daily_summary&testEmail=kyle@leadlabsplus.com
```

### Test Daily Summary Cron (Manual Trigger)
```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-summary" \
  -H "Authorization: Bearer 6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d"
```

---

## Step 5: Verify Cron Job Setup

1. Go to Vercel Dashboard > Project Settings > Cron Jobs
2. Verify daily-summary cron is listed:
   - Path: `/api/cron/daily-summary`
   - Schedule: `0 9 * * *` (9:00 AM UTC daily)
3. Check execution logs after 9:00 AM UTC tomorrow

---

## Step 6: Update Retell Webhooks

After deployment, update your Retell agents with the production webhook URL:

```
Webhook URL: https://your-app.vercel.app/api/webhooks/retell/call-events
```

Do this for each agent via Retell dashboard or API.

---

## Verification Checklist

- [ ] All environment variables added to Vercel
- [ ] Project deployed successfully
- [ ] Database migration ran successfully
- [ ] Test emails sent successfully
- [ ] Cron job visible in Vercel dashboard
- [ ] Retell webhooks updated with production URL
- [ ] Email notifications working on test call

---

## Monitoring

### Check Logs
```bash
vercel logs --scope kyles-projects-84986792
```

### Check Cron Job Logs
Go to: https://vercel.com/kyles-projects-84986792/voice-ai-platform/logs

Filter by: `/api/cron/daily-summary`

### Check Email Delivery
Go to: https://resend.com/emails

---

## Troubleshooting

### Emails not sending?
1. Check RESEND_API_KEY is correct in Vercel env vars
2. Check email logs in Resend dashboard
3. Verify FROM_EMAIL is `onboarding@resend.dev` (works without domain verification)

### Cron job not running?
1. Verify CRON_SECRET matches in env vars
2. Check cron is enabled in vercel.json
3. Check logs for authentication errors

### Webhooks not working?
1. Verify NEXT_PUBLIC_APP_URL points to production
2. Check Retell agent webhook URL is correct
3. Test webhook endpoint: `curl https://your-app.vercel.app/api/webhooks/retell/call-events`

---

## Next Steps (After Deployment)

1. **Custom Email Domain** (Optional)
   - Verify domain in Resend: https://resend.com/domains
   - Update `RESEND_FROM_EMAIL` to `notifications@yourdomain.com`

2. **Email Templates** (Optional)
   - Customize HTML templates in `/lib/services/email.service.ts`
   - Add company branding, colors, logos

3. **Notification Preferences UI**
   - Add settings page in dashboard to toggle email preferences
   - Users can enable/disable: message_taken, appointment_booked, daily_summary

4. **Testing with Real Calls**
   - Make test calls through Retell
   - Verify emails arrive with correct customer info
   - Check daily summary arrives at 9am next day
