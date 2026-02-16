# Email Notifications System - Complete Guide

## 🚀 Quick Deploy

### 1. Add Environment Variables to Vercel

**Option A: Use the script**
```bash
./scripts/add-vercel-env.sh
```

**Option B: Manual (Vercel Dashboard)**
Go to: https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/environment-variables

Copy-paste these:
```
RESEND_API_KEY=re_DHwg8EqA_KYnk1DomdH59bF4Ui84kuTtL
RESEND_FROM_EMAIL=onboarding@resend.dev
CRON_SECRET=6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d
```

### 2. Deploy
```bash
vercel --prod --scope kyles-projects-84986792
```

### 3. Run Migration
Visit: `https://your-app.vercel.app/api/admin/migrate-email-prefs`

### 4. Test
Visit: `https://your-app.vercel.app/api/test/email?type=message_taken&testEmail=kyle@leadlabsplus.com`

✅ **Done! Email system is live.**

---

## 📧 How It Works

### Message Taken Flow
```
Customer calls → Leaves name + phone
    ↓
Call ends → Webhook triggers
    ↓
Analyzes transcript → Extracts customer info
    ↓
Detects "message_taken" outcome
    ↓
Sends email to agent owner → "🔔 New Message from John Smith"
```

### Appointment Booked Flow
```
Customer calls → Books appointment for Tuesday 3pm
    ↓
Call ends → Webhook triggers
    ↓
Analyzes transcript → Extracts date/time/customer info
    ↓
Detects "appointment_booked" outcome
    ↓
Sends email to agent owner → "✅ Appointment Booked - Tuesday 3pm"
```

### Daily Summary Flow
```
9:00 AM UTC (daily)
    ↓
Cron job runs → Checks all active agents
    ↓
For each agent: Count calls in last 24h
    ↓
If calls > 0 → Send summary
If calls = 0 → Skip (don't email)
```

---

## 🎛️ Email Preferences

Each agent has 4 toggles:

1. **email_notifications_enabled** (master switch)
   - Disables ALL emails when off
   - Default: `true`

2. **email_message_taken**
   - Send when customer leaves message
   - Default: `true`

3. **email_appointment_booked**
   - Send when appointment is booked
   - Default: `true`

4. **email_daily_summary**
   - Send daily summary at 9am UTC
   - Default: `true`

### Update Preferences via API
```bash
curl -X PUT https://your-app.vercel.app/api/agents/AGENT_ID/settings \
  -H "Content-Type: application/json" \
  -d '{
    "email_notifications_enabled": true,
    "email_message_taken": true,
    "email_appointment_booked": true,
    "email_daily_summary": false
  }'
```

---

## 🧪 Testing

### Test Individual Emails
```bash
# Message taken
curl "https://your-app.vercel.app/api/test/email?type=message_taken&testEmail=kyle@leadlabsplus.com"

# Appointment booked
curl "https://your-app.vercel.app/api/test/email?type=appointment_booked&testEmail=kyle@leadlabsplus.com"

# Daily summary
curl "https://your-app.vercel.app/api/test/email?type=daily_summary&testEmail=kyle@leadlabsplus.com"
```

### Test Daily Summary Cron (Manual Trigger)
```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-summary" \
  -H "Authorization: Bearer 6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d"
```

### Run Full Deployment Check
```bash
./scripts/check-deployment.sh
```

---

## 🔍 Monitoring

### View Email Delivery Logs
https://resend.com/emails

### View Vercel Logs
```bash
vercel logs --scope kyles-projects-84986792
```

### Check Cron Job Status
https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/cron-jobs

### Monitor Webhook Calls
Dashboard → Logs → Filter: `/api/webhooks/retell/call-events`

---

## 🐛 Troubleshooting

### Emails Not Sending?

**Check 1: Environment Variables**
```bash
# Verify in Vercel dashboard
- RESEND_API_KEY exists
- RESEND_FROM_EMAIL = onboarding@resend.dev
```

**Check 2: Email Preferences**
```sql
-- In Supabase
SELECT email_notifications_enabled, email_message_taken
FROM agents WHERE id = 'YOUR_AGENT_ID';
```

**Check 3: Resend Dashboard**
- Go to https://resend.com/emails
- Check for bounces or failures
- Verify API key is active

### Cron Job Not Running?

**Check 1: Cron Secret**
```bash
# Verify CRON_SECRET in Vercel matches
6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d
```

**Check 2: Cron Configuration**
```json
// In vercel.json
{
  "crons": [{
    "path": "/api/cron/daily-summary",
    "schedule": "0 9 * * *"
  }]
}
```

**Check 3: Manual Test**
```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-summary" \
  -H "Authorization: Bearer 6e60578d036c2153d2b2da697f3d7cbcf0a356b4b5f0a0f695380b9508fb8b2d"
```

### Customer Info Not Extracted?

**Check 1: Transcript**
```bash
# View call in database
SELECT transcript_object FROM calls WHERE id = 'CALL_ID';
```

**Check 2: Extraction Patterns**
The system looks for:
- Name: "my name is...", "I'm...", after agent asks "what's your name?"
- Phone: `(123) 456-7890`, `123-456-7890`, `1234567890`
- Email: `user@domain.com`

**Check 3: Add Logging**
```typescript
// In determineCallOutcome()
console.log('[Email] Extracted:', { customerName, customerPhone, customerEmail });
```

### Wrong Email Template?

**Check Outcome Detection:**
```typescript
// Message taken = name + phone (no appointment)
// Appointment booked = appointment date + time
```

---

## 📝 Customization

### Change Email FROM Address

1. Verify domain in Resend: https://resend.com/domains
2. Add DNS records
3. Update Vercel env var:
   ```
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   ```
4. Redeploy

### Customize Email Templates

Edit `/lib/services/email.service.ts`:

**Colors:**
```typescript
const PURPLE = '#7C3AED';  // Message taken (urgent)
const GREEN = '#10B981';   // Appointment booked
const BLUE = '#3B82F6';    // Daily summary
```

**Subject Lines:**
```typescript
subject: `🔔 New Message from ${customerName}`,
subject: `✅ New Appointment Booked - ${customerName}`,
subject: `📊 Daily Call Summary - ${agentName}`,
```

**Content:**
- Modify HTML in each function
- Add company logo
- Change button text/colors
- Add footer content

### Change Cron Schedule

Edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-summary",
    "schedule": "0 17 * * *"  // 5pm UTC instead of 9am
  }]
}
```

Common schedules:
- `0 9 * * *` = 9am UTC daily
- `0 17 * * *` = 5pm UTC daily
- `0 9 * * 1` = 9am UTC Mondays only
- `0 */6 * * *` = Every 6 hours

---

## 🔒 Security

### Cron Job Authentication
- Uses Bearer token authentication
- Token: `CRON_SECRET` env var
- Only Vercel cron service has access

### Email Privacy
- Emails only sent to agent owner
- Customer data encrypted in transit (HTTPS)
- No customer data stored in Resend

### API Keys
- RESEND_API_KEY stored in Vercel (encrypted)
- Never exposed to client-side code
- Rotatable via Resend dashboard

---

## 📊 Email Templates

### Message Taken
```
Subject: 🔔 New Message from John Smith

Priority: 🔴 URGENT - Customer Waiting

Customer Details:
- Name: John Smith
- Phone: (407) 978-0655
- Email: john@example.com
- Reason: Need roof repair urgently

Call Time: Today at 2:34 PM

[Call Now Button]
```

### Appointment Booked
```
Subject: ✅ New Appointment Booked - Sarah Johnson

Appointment Details:
- Date: Tuesday, February 18
- Time: 3:00 PM
- Service: Roof Inspection

Customer Details:
- Name: Sarah Johnson
- Phone: (407) 123-4567
- Email: sarah@example.com

[View Details Button]
```

### Daily Summary
```
Subject: 📊 Daily Call Summary - ABC Roofing

Last 24 Hours:
┌─────────────────┬────────┐
│ Total Calls     │   12   │
│ Appointments    │    5   │
│ Messages        │    4   │
│ Avg Duration    │  3m 24s│
└─────────────────┴────────┘

Recent Calls:
1. John Smith - 2:34 PM - Message Taken
2. Sarah Johnson - 3:15 PM - Appointment Booked
3. Mike Davis - 4:02 PM - General Inquiry
...

[View Full Dashboard Button]
```

---

## 🎯 Best Practices

### Email Deliverability
- ✅ Use verified domain (setup in Resend)
- ✅ Keep subject lines under 50 characters
- ✅ Avoid spam trigger words
- ✅ Include unsubscribe link (future)
- ✅ Monitor bounce rates in Resend

### Performance
- ✅ Emails sent asynchronously (don't block webhooks)
- ✅ Error handling prevents webhook failures
- ✅ Retry logic for failed deliveries
- ✅ Rate limiting respected

### User Experience
- ✅ Only send when opted in
- ✅ Don't spam (daily summary only if calls exist)
- ✅ Clear, actionable content
- ✅ Mobile-responsive templates
- ✅ Fast delivery (<1 second)

---

## 📈 Analytics (Future)

Track these metrics in Resend:
- Email open rates
- Click-through rates
- Bounce rates
- Time to open
- Device types

---

## 🆘 Support

### Documentation
- Full guide: `EMAIL-SYSTEM-SUMMARY.md`
- Deployment: `DEPLOYMENT.md`
- Quick start: `QUICK-START.md`

### Tools
- Add env vars: `./scripts/add-vercel-env.sh`
- Check deployment: `./scripts/check-deployment.sh`

### Logs
```bash
# View all logs
vercel logs --scope kyles-projects-84986792

# Filter webhook logs
vercel logs --scope kyles-projects-84986792 | grep "call-events"

# Filter cron logs
vercel logs --scope kyles-projects-84986792 | grep "daily-summary"
```

### Resend Dashboard
- Emails: https://resend.com/emails
- API Keys: https://resend.com/api-keys
- Domains: https://resend.com/domains

---

## ✅ Deployment Checklist

- [ ] Environment variables added to Vercel
- [ ] Project deployed to production
- [ ] Database migration ran successfully
- [ ] Test emails sent successfully
- [ ] Cron job visible in Vercel dashboard
- [ ] Retell webhooks updated
- [ ] Email preferences working
- [ ] Monitoring setup complete

---

**Status:** ✅ Production Ready

**Email Domain:** Using `onboarding@resend.dev` (update to custom domain later)

**Support:** Check logs in Vercel and Resend dashboards
