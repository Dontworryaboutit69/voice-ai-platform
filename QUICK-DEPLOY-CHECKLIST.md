# Quick Deploy Checklist ✅

## Step 1: Create GitHub Repository (2 min)
- [ ] Go to https://github.com/new
- [ ] Repository name: `voice-ai-platform`
- [ ] Visibility: Private
- [ ] Click "Create repository"
- [ ] Copy the repository URL

## Step 2: Push Code to GitHub (1 min)
Run this in your terminal:
```bash
cd /Users/kylekotecha/Desktop/voice-ai-platform
git remote add origin YOUR_GITHUB_URL_HERE
git push -u origin main
```

## Step 3: Deploy to Vercel (2 min)
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select `voice-ai-platform`
- [ ] Click "Import"

## Step 4: Add Environment Variables (3 min)
Before clicking "Deploy", add these variables (copy from `.env.production`):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `RETELL_API_KEY`
- [ ] `ELEVENLABS_API_KEY`
- [ ] `RENTCAST_API_KEY`

**Leave `NEXT_PUBLIC_APP_URL` blank for now** - we'll add it after deployment.

- [ ] Click "Deploy"
- [ ] Wait for deployment (~2-3 minutes)

## Step 5: Update APP_URL (2 min)
- [ ] Copy your production URL (e.g., `https://voice-ai-platform-xxx.vercel.app`)
- [ ] Go to project Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_APP_URL` = your production URL
- [ ] Save
- [ ] Go to Deployments → Click "..." → Redeploy

## Step 6: Test! (1 min)
- [ ] Visit your production URL
- [ ] Log in
- [ ] Go to your agent
- [ ] Click "Test with Voice"
- [ ] Have a short conversation
- [ ] End the call
- [ ] Check "Recent Calls" tab
- [ ] **Verify the call appears!** ✅

---

## What's Fixed?

✅ Webhook URL is now publicly accessible
✅ Retell can send call events to your platform
✅ Calls automatically sync to database
✅ Transcripts and recordings saved
✅ No manual sync needed

---

## Troubleshooting

### Call doesn't appear in dashboard?
1. Check Vercel Functions logs for webhook events
2. Verify `NEXT_PUBLIC_APP_URL` is set correctly
3. Test webhook: `curl https://YOUR_URL/api/webhooks/retell/test`

### Deployment fails?
1. Check Vercel build logs
2. Verify all environment variables are set
3. Make sure `package.json` has all dependencies

---

**Total Time: ~10 minutes**
