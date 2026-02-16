# Integration System - Quick Start Guide

## 🚀 For Developers

### Adding the Integration System to Call Webhook

**File to modify:** `/app/api/webhooks/retell/call-events/route.ts`

Add this to the `handleCallEnded` function:

```typescript
import { processCallThroughIntegrations } from '@/lib/integrations/integration-factory';

async function handleCallEnded(callData: any, metadata: any) {
  // ... existing code to save call ...

  // NEW: Process through integrations
  const callIntegrationData = {
    callId: updatedCall.id,
    agentId: agentId,
    customerName: extractedData.name,
    customerPhone: extractedData.phone,
    customerEmail: extractedData.email,
    callOutcome: callData.call_analysis?.outcome || 'completed',
    callSummary: callData.call_analysis?.summary,
    callSentiment: callData.call_analysis?.sentiment,
    transcript: callData.transcript,
    recordingUrl: callData.recording_url,
    startedAt: new Date(callData.start_timestamp),
    endedAt: new Date(callData.end_timestamp),
    durationSeconds: Math.floor(callData.call_length_seconds),
    appointmentBooked: extractedData.appointment ? {
      title: `Appointment with ${extractedData.name}`,
      date: extractedData.appointment.date,
      time: extractedData.appointment.time,
      timezone: extractedData.appointment.timezone || 'America/New_York',
      durationMinutes: 60,
      serviceType: extractedData.service_requested,
    } : undefined,
  };

  // Run integrations asynchronously (don't block webhook response)
  processCallThroughIntegrations(agentId, callIntegrationData)
    .catch(error => console.error('[Webhook] Integration sync failed:', error));
}
```

### Environment Variables to Add

Add to `.env.local` and Vercel:

```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# HubSpot OAuth
HUBSPOT_CLIENT_ID=your-hubspot-client-id
HUBSPOT_CLIENT_SECRET=your-hubspot-client-secret

# Salesforce OAuth
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
```

---

## 📱 For Users

### How to Connect Each Integration

#### 1. Google Calendar

**Steps:**
1. Go to Agent Settings → Integrations
2. Click "Connect Google Calendar"
3. Sign in with Google
4. Grant calendar permissions
5. Select which calendar to use (default: primary)
6. Configure business hours (optional)
7. Save

**What it does:**
- Checks availability during calls
- Books appointments directly
- Sends email invitations

---

#### 2. GoHighLevel

**Steps:**
1. Get API Key from GoHighLevel:
   - Go to Settings → Integrations & API → API Key
   - Copy API Key
2. Get Location ID:
   - Go to Settings → Business Profile
   - Copy Location ID from URL
3. In Platform:
   - Click "Connect GoHighLevel"
   - Paste API Key
   - Paste Location ID
   - (Optional) Add Calendar ID for appointments
4. Test Connection
5. Save

**What it does:**
- Creates/updates contacts
- Adds call notes
- Books appointments
- Triggers workflows
- Adds to pipeline

---

#### 3. Zapier (Universal)

**Steps:**
1. In Zapier:
   - Create new Zap
   - Trigger: "Webhooks by Zapier"
   - Choose "Catch Hook"
   - Copy webhook URL
2. In Platform:
   - Click "Connect Zapier"
   - Paste webhook URL
   - Click "Send Test Data"
3. In Zapier:
   - Verify test data received
   - Add action steps (Google Sheets, Gmail, etc.)
   - Turn on Zap
4. Done!

**What it does:**
- Sends complete call data to Zapier
- Zapier can then send to ANY app (5,000+ options)

**Popular Zap Ideas:**
- Add row to Google Sheets
- Send email via Gmail
- Create Trello card
- Add to Airtable
- Send Slack message
- Update Excel Online

---

#### 4. Housecall Pro

**Steps:**
1. Get API Key from Housecall Pro:
   - Contact Housecall Pro support
   - Request API access
2. Get Company ID:
   - Found in Housecall Pro settings
3. In Platform:
   - Click "Connect Housecall Pro"
   - Paste API Key
   - Paste Company ID
   - (Optional) Set default employee for jobs
4. Test Connection
5. Save

**What it does:**
- Creates customers
- Creates jobs
- Schedules appointments
- Adds notes to customers

---

#### 5. HubSpot

**Steps:**
1. Go to Agent Settings → Integrations
2. Click "Connect HubSpot"
3. Sign in to HubSpot
4. Grant permissions
5. Select pipeline (optional)
6. Configure field mapping (optional)
7. Save

**What it does:**
- Creates/updates contacts
- Adds notes (engagements)
- Creates meetings
- Creates deals
- Enrolls in workflows

---

#### 6. Salesforce

**Steps:**
1. Go to Agent Settings → Integrations
2. Click "Connect Salesforce"
3. Sign in to Salesforce
4. Grant permissions
5. Choose: Create as "Lead" or "Contact"
6. Configure field mapping (optional)
7. Save

**What it does:**
- Creates leads or contacts
- Adds tasks (call notes)
- Creates events (appointments)
- Creates opportunities

---

## 🎯 Common Use Cases

### Use Case 1: Roofing Company

**Setup:**
- GoHighLevel (primary CRM)
- Google Calendar (appointments)

**Flow:**
1. Customer calls about roof repair
2. Agent collects info: name, phone, address, issue
3. Agent books inspection for Tuesday 2pm
4. **Platform syncs:**
   - Creates contact in GoHighLevel
   - Adds call note with issue details
   - Books appointment in Google Calendar
   - Sends calendar invite to customer
   - Triggers GHL workflow "New Inspection Booked"

---

### Use Case 2: Agency Managing Multiple Clients

**Setup:**
- Zapier → Google Sheets (per-client tracking)

**Flow:**
1. Customer calls client's AI agent
2. Call completes
3. **Platform sends to Zapier:**
   - Call data with transcript
   - Customer info
   - Call outcome
4. **Zapier adds row to client's Google Sheet:**
   - Timestamp, customer, outcome, recording link

---

### Use Case 3: Home Services (Plumbing)

**Setup:**
- Housecall Pro (primary system)

**Flow:**
1. Customer calls about water heater issue
2. Agent collects info and schedules service
3. **Platform syncs to Housecall Pro:**
   - Creates customer
   - Creates job: "Water Heater Repair"
   - Schedules job for available slot
   - Assigns to default technician

---

### Use Case 4: Enterprise Sales Team

**Setup:**
- Salesforce (primary CRM)
- HubSpot (marketing automation)

**Flow:**
1. Prospect calls about enterprise plan
2. Agent qualifies lead
3. **Platform syncs to both:**
   - **Salesforce:** Creates Lead, adds Task note, creates Opportunity
   - **HubSpot:** Creates Contact, enrolls in "Enterprise Demo" workflow

---

## 🔧 Outbound Calling Setup

### From GoHighLevel

**GoHighLevel Workflow:**
```
Trigger: Contact tagged "Ready to Call"
   ↓
Action: Webhook POST
URL: https://your-platform.com/api/agents/ABC123/outbound/call
Body:
{
  "phone": "{{contact.phone}}",
  "contact_name": "{{contact.full_name}}",
  "contact_data": {
    "email": "{{contact.email}}",
    "lead_source": "{{contact.source}}"
  }
}
   ↓
Platform makes call
   ↓
Results sent back to GHL
   ↓
Update contact: Add note + tag
```

---

### From Zapier

**Zap Setup:**
```
Trigger: New row in Google Sheets
   ↓
Filter: Column "Status" = "Call"
   ↓
Action: Webhooks by Zapier - POST
URL: https://your-platform.com/api/agents/ABC123/outbound/call
Body:
{
  "phone": [Phone Column],
  "contact_name": [Name Column],
  "contact_data": {
    "company": [Company Column]
  }
}
```

---

## 📊 Monitoring & Debugging

### View Integration Status

**Dashboard:** Agent Settings → Integrations → Status Tab

Shows:
- ✅ Connected integrations
- 📊 Sync stats (success rate)
- ⚠️ Failed syncs
- 🕐 Last sync time

### View Sync Logs

**SQL Query:**
```sql
SELECT
  isl.created_at,
  ic.integration_type,
  isl.operation_type,
  isl.status,
  isl.error_message,
  c.customer_phone
FROM integration_sync_logs isl
JOIN integration_connections ic ON ic.id = isl.integration_connection_id
LEFT JOIN calls c ON c.id = isl.call_id
WHERE ic.agent_id = 'YOUR_AGENT_ID'
ORDER BY isl.created_at DESC
LIMIT 50;
```

### Common Issues & Fixes

**Issue:** OAuth token expired
```
Error: "Invalid access token"
Fix: Token should auto-refresh. If not, reconnect integration.
```

**Issue:** Contact already exists
```
Error: "Duplicate contact"
Fix: Integration should find existing contact. Check search logic.
```

**Issue:** Rate limit exceeded
```
Error: "Too many requests"
Fix: Syncs are rate-limited. Wait 1 minute and retry.
```

**Issue:** Webhook not triggering
```
Error: No data received
Fix:
1. Check webhook URL is correct
2. Verify HTTPS (not HTTP)
3. Check webhook secret matches
4. Test with curl to verify endpoint works
```

---

## 🎓 Training Your Team

### For Sales/Support

**Key Points:**
- All call data automatically syncs to their CRM
- No manual data entry needed
- Recordings attached to contact records
- Appointments auto-scheduled

**Demo Script:**
1. Show them CRM before call
2. Make test call
3. Show them CRM after call
4. Point out: new contact, call note, recording, appointment

### For Users Setting Up

**Checklist:**
- [ ] Choose which CRM(s) to connect
- [ ] Get API keys or complete OAuth
- [ ] Test connection
- [ ] Make test call
- [ ] Verify data in CRM
- [ ] Configure field mappings (if needed)
- [ ] Set up outbound webhooks (if needed)

---

## 🚦 Go-Live Checklist

### Pre-Launch
- [ ] Database migration deployed (`011_integrations.sql`)
- [ ] Environment variables added to Vercel
- [ ] OAuth apps created (Google, HubSpot, Salesforce)
- [ ] API routes deployed
- [ ] Webhook handler updated

### Testing
- [ ] Test each integration type
- [ ] Test OAuth flow
- [ ] Test API key validation
- [ ] Test webhook sending
- [ ] Test outbound call trigger
- [ ] Test error handling
- [ ] Test token refresh

### Launch
- [ ] Enable for beta users
- [ ] Monitor sync logs
- [ ] Check error rates
- [ ] Gather user feedback
- [ ] Iterate based on feedback

### Post-Launch
- [ ] Add more CRMs (ServiceTitan, Jobber, etc.)
- [ ] Add retry queue for failed syncs
- [ ] Add bulk sync for historical calls
- [ ] Add webhook signatures
- [ ] Add usage analytics

---

**Status:** ✅ System Ready for API Routes & UI
**Next Step:** Build API endpoints for connection management
