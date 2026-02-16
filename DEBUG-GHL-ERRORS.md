# Debugging GoHighLevel Integration Errors

## Errors Found

1. **"Webhook fetch failed: 'Agent not found'"** - Line 164 in IntegrationModal.tsx
2. **"Calendar fetch failed: 'GHL API error: Not Found'"** - Line 138 in IntegrationModal.tsx

## Root Causes

### Error 1: Agent Not Found
The webhook endpoint `/api/agents/[agentId]/trigger-call` expects a `webhook_token` column in the agents table.

**Check if migration was applied:**
```bash
# In Supabase Dashboard SQL Editor, run:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name = 'webhook_token';

# Should return webhook_token column, if empty then migration wasn't applied
```

**If migration not applied, run:**
```sql
-- From migration 012_webhook_token.sql
alter table public.agents add column if not exists webhook_token text unique;
create index if not exists idx_agents_webhook_token on public.agents(webhook_token);
```

### Error 2: GHL API Not Found
The GoHighLevel API endpoint might be incorrect. Let's test which endpoint works.

**Test API endpoints:**
```bash
# Set your credentials
export GHL_API_KEY="your_api_key_here"
export GHL_LOCATION_ID="tSlwVUx54VrpROwxBAgm"

# Run test script
npx tsx test-ghl-api.ts
```

This will test:
- `/v1/calendars/?locationId=...`
- `/v1/calendars/services?locationId=...`
- `/v1/locations/{locationId}`
- `/v1/contacts/?locationId=...&limit=1`

**Expected results:**
- At least one endpoint should return 200 OK
- If all return 404, the API key or location ID is wrong
- If all return 401, the API key is invalid

## Quick Fix Steps

### Step 1: Apply Database Migration
```bash
# Option A: Via Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run the SQL from migration 012_webhook_token.sql

# Option B: Via local Supabase CLI (if linked)
npx supabase db push
```

### Step 2: Test GoHighLevel API
```bash
# Test with your actual credentials
GHL_API_KEY="your_key" GHL_LOCATION_ID="your_loc_id" npx tsx test-ghl-api.ts
```

### Step 3: Update API Endpoint (if needed)
If the test shows a different endpoint works, update `/lib/integrations/gohighlevel.ts`:

```typescript
// Line 379 - Current
`${this.baseUrl}/calendars/?locationId=${this.locationId}`

// Try this instead if /calendars doesn't work:
`${this.baseUrl}/calendars/services?locationId=${this.locationId}`
```

### Step 4: Check Server Logs
Look for actual error messages in the terminal where `npm run dev` is running. The errors in the browser console are summarized - the server logs will show the full GoHighLevel API response.

## Testing After Fixes

Once fixed, test the integration:

1. Go to agent page
2. Click "+ Add Integration"
3. Select "GoHighLevel"
4. Enter API Key and Location ID
5. Click "Load My Calendars"
6. Should see calendars list (not error)
7. Select a calendar
8. Click "Save & Connect"
9. Verify webhook section appears with URL and token

## Expected Behavior

After fixes:
- ✅ Webhook section shows URL like: `https://your-domain.com/api/agents/xxx/trigger-call`
- ✅ Webhook token is displayed (64-character random string)
- ✅ Calendars load and display in dropdown
- ✅ Can select calendar and save integration

## Next Steps

After this works, proceed with the End-to-End Test Plan:
- Phase 3: Test API endpoint directly with curl
- Phase 4: Make test call and verify AI checks availability
- Phase 5: Verify appointment appears in GoHighLevel calendar
