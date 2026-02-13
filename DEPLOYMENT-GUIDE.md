# Vercel Deployment Guide - Voice AI Platform

## Quick Setup (5 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `voice-ai-platform`
3. Keep it **Private**
4. Click "Create repository"
5. Run these commands in your terminal:

```bash
cd /Users/kylekotecha/Desktop/voice-ai-platform
git remote add origin https://github.com/YOUR_USERNAME/voice-ai-platform.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `voice-ai-platform` from the list
4. Click "Import"
5. **IMPORTANT**: Before clicking "Deploy", add these environment variables:

#### Required Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://qoendwnzpsmztgonrxzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTQxMzAsImV4cCI6MjA4NjUzMDEzMH0.WBxPzqXWeuFqzfPKzyAkpNVtqiY_vkSBKk1FZy7zg5A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE
ANTHROPIC_API_KEY=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
RETELL_API_KEY=key_85da79d1d9da73aee899af323f23
ELEVENLABS_API_KEY=sk_0e17edf6e4a0654b3fdb050aa6c57e7d46c908eab8ebc0e0
RENTCAST_API_KEY=514bcf62f55c4673a73e4abca99e281c
```

6. Click "Deploy"
7. Wait for deployment to complete (~2-3 minutes)

### Step 3: Get Your Production URL

After deployment completes, you'll see a URL like:
```
https://voice-ai-platform-xxx.vercel.app
```

**Copy this URL** - we need it for the next step!

### Step 4: Update Environment Variable

1. In Vercel dashboard, go to your project settings
2. Go to "Environment Variables"
3. Add a new variable:
   - Name: `NEXT_PUBLIC_APP_URL`
   - Value: `https://voice-ai-platform-xxx.vercel.app` (your production URL)
   - Environment: Production, Preview, Development (all three)
4. Click "Save"
5. Go to "Deployments" tab
6. Click "..." on the latest deployment → "Redeploy"
7. Check "Use existing Build Cache"
8. Click "Redeploy"

---

## What This Fixes

Once deployed, your webhook URL will be:
```
https://voice-ai-platform-xxx.vercel.app/api/webhooks/retell/call-events
```

This URL is **publicly accessible** so Retell's servers can send webhooks to it.

When you do a voice test, the system will:
1. Configure the Retell agent with this webhook URL
2. Retell makes the call
3. Retell sends `call_started` webhook → Creates call record in database
4. Retell sends `call_ended` webhook → Updates call with transcript, recording, etc.
5. Call appears in your dashboard automatically ✅

---

## Testing After Deployment

1. Go to your production URL: `https://voice-ai-platform-xxx.vercel.app`
2. Log in to your account
3. Go to your agent
4. Click "Test with Voice"
5. Have a conversation
6. End the call
7. **Check "Recent Calls"** - your call should appear automatically!

---

## Troubleshooting

### If calls still don't appear:

1. Check Vercel deployment logs:
   ```bash
   vercel logs --scope kyles-projects-84986792
   ```

2. Test webhook endpoint:
   ```bash
   curl https://voice-ai-platform-xxx.vercel.app/api/webhooks/retell/test
   ```
   Should return: `{"success":true,"message":"Retell webhook endpoint is accessible"}`

3. Check that `NEXT_PUBLIC_APP_URL` is set correctly in Vercel

4. Do a new voice test and check Vercel logs for webhook events

---

## Alternative: Use ngrok for Local Testing

If you want to test webhooks locally before deploying:

```bash
# Install ngrok
brew install ngrok

# Start your dev server
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update .env.local:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

Then restart your dev server and do a voice test. Webhooks will work!

---

## Next Steps After Deployment

1. ✅ Test voice calls work
2. ✅ Verify calls appear in dashboard
3. ✅ Check transcripts are saved
4. Set up custom domain (optional)
5. Configure production auth settings
