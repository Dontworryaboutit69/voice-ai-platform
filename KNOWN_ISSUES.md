# Known Issues

This document tracks known bugs, flaky behavior, and issues that need to be addressed.

## 🔴 Critical Issues

### 1. OAuth State RLS Policy Blocks Non-Authenticated Users
**Status:** Workaround in place (using service role key)
**Location:** `app/api/integrations/oauth/hubspot/authorize/route.ts`, `app/api/integrations/oauth/salesforce/authorize/route.ts`

**Issue:**
The `oauth_states` table has an RLS policy that requires `auth.uid() = user_id`. However, OAuth flows can be initiated without a logged-in user (e.g., from email links, external sources), causing the insert to fail.

**Current Workaround:**
Using service role key to bypass RLS entirely.

**Reproduction Steps:**
1. Log out of the application
2. Navigate to `/agents/[id]/integrations`
3. Click "Connect HubSpot"
4. OAuth state insert fails with RLS policy violation

**Proper Fix Needed:**
- Allow service-to-service OAuth state creation without user authentication
- Add a separate policy for API routes (using request-based authentication)
- OR store state in Redis/temporary storage instead of database

---

### 2. Integration Connections RLS Has Circular Reference
**Status:** Workaround in place (using service role key)
**Location:** `app/api/integrations/oauth/hubspot/callback/route.ts`, `lib/integrations/integration-factory.ts`

**Issue:**
The `integration_connections` table RLS policy checks `organization_members` which creates infinite recursion when using server client (non-service role).

**Error:**
```
infinite recursion detected in policy for relation organization_members
```

**Current Workaround:**
Using service role key for all integration_connections inserts/updates.

**Reproduction Steps:**
1. Try to insert into integration_connections using createServerClient
2. RLS policy triggers lookup to organization_members
3. Organization_members policy references back, creating circular dependency

**Proper Fix Needed:**
- Simplify RLS policies to avoid circular references
- Use agent_id → agents → organization_id directly instead of organization_members lookup
- Add proper indexes to support the lookup efficiently

---

### 3. Retell Webhooks Accept Unsigned Requests
**Status:** No verification implemented
**Location:** `app/api/webhooks/retell/call-events/route.ts`, `app/api/webhooks/retell/sync-calls/route.ts`

**Issue:**
Webhook endpoints accept any POST request without verifying it came from Retell. This allows attackers to:
- Trigger fake calls
- Spam the database
- Trigger CRM integrations with fake data
- Cause API rate limit issues

**Reproduction Steps:**
```bash
curl -X POST http://localhost:3000/api/webhooks/retell/call-events \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_ended",
    "call": {
      "call_id": "fake_call_123",
      "metadata": { "agent_id": "any-agent-id" }
    }
  }'
```
Result: Webhook is processed successfully, creates fake call record.

**Proper Fix Needed:**
- Implement Retell webhook signature verification
- Use `x-retell-signature` header to verify requests
- Add webhook secret to environment variables

---

## 🟡 High Priority Issues

### 4. OAuth Tokens Stored in Plain Text
**Status:** No encryption implemented
**Location:** `integration_connections` table, all OAuth callbacks

**Issue:**
HubSpot, Salesforce, and Google OAuth access tokens are stored unencrypted in the database. If the database is compromised, attackers gain access to all connected CRMs.

**Security Impact:**
- GDPR violation (sensitive credentials must be encrypted)
- SOC 2 compliance failure
- Massive liability if breached

**Proper Fix Needed:**
- Encrypt tokens before storing (AES-256)
- Use Supabase Vault or separate key management service
- Rotate encryption keys periodically

---

### 5. Google OAuth Credentials Exposed via postMessage
**Status:** Security vulnerability
**Location:** `app/api/integrations/oauth/google/callback/route.ts`

**Issue:**
Google OAuth callback sends credentials to parent window using `postMessage('*')` with wildcard origin. This allows:
- Browser extensions to intercept credentials
- Malicious scripts on any page to receive credentials
- XSS attacks to steal OAuth tokens

**Reproduction Steps:**
1. Open browser console on any page
2. Add listener: `window.addEventListener('message', console.log)`
3. Complete Google OAuth flow
4. Console logs full credentials including access token

**Proper Fix Needed:**
- Store credentials in database (like HubSpot/Salesforce)
- Use specific origin in postMessage
- Don't send credentials via client-side messaging

---

### 6. No Authorization Check on OAuth Callbacks
**Status:** Security vulnerability
**Location:** All OAuth callback routes

**Issue:**
OAuth callbacks don't verify that the user completing the OAuth flow has permission to connect integrations for the specified agent. Any user with a valid state token can complete OAuth for any agent.

**Attack Scenario:**
1. Attacker initiates OAuth for victim's agent (gets state token)
2. Attacker completes OAuth with their own HubSpot account
3. Victim's calls now sync to attacker's HubSpot

**Proper Fix Needed:**
- Verify user_id in oauth_state matches current authenticated user
- Check user is member of agent's organization
- Add agent_id → organization_id → user_id authorization chain

---

## 🟠 Medium Priority Issues

### 7. AI Manager Runs on Every Call (Expensive)
**Status:** Always enabled, no opt-in
**Location:** `app/api/webhooks/retell/call-events/route.ts:159`

**Issue:**
Every call triggers Claude API analysis (evaluateCallAsync) even if customer doesn't use AI Manager feature. This costs ~$0.01 per call.

**Cost Impact:**
- 10,000 calls/day = $100/day = $36,500/year
- Runs even during free trial
- No way to disable per-agent

**Reproduction Steps:**
1. Make any test call
2. Check server logs - `[AI Manager] Evaluation failed` or success
3. This runs on EVERY call_ended event

**Proper Fix Needed:**
- Make AI Manager opt-in (agent setting)
- Only analyze if `agent.ai_manager_enabled = true`
- Consider batching analysis to reduce costs

---

### 8. No Rate Limiting on Public API Routes
**Status:** Vulnerable to abuse
**Location:** All `/api/webhooks/` and `/api/integrations/` routes

**Issue:**
No rate limiting on:
- Webhook endpoints (can be spammed)
- OAuth endpoints (can be brute-forced)
- Test call endpoints

**Attack Scenario:**
- Send 1,000,000 webhook requests → database fills up, bill skyrockets
- Brute force OAuth state tokens
- DDoS attack on API routes

**Proper Fix Needed:**
- Implement rate limiting (Upstash Redis or Vercel middleware)
- Max 100 requests/minute per IP
- Exponential backoff for failed requests

---

## 🟢 Low Priority Issues

### 9. Integration Sync Logs Not Created
**Status:** Feature partially working
**Location:** `lib/integrations/integration-factory.ts:417`

**Issue:**
`integration_sync_logs` table should track every sync operation, but no logs are being created. This makes debugging integration issues difficult.

**Reproduction Steps:**
1. Make a test call with HubSpot connected
2. Check `integration_sync_logs` table
3. Expected: Log entry with status, error message
4. Actual: No entries created

**Current Workaround:**
Check server logs manually.

**Fix Needed:**
- Verify sync log insertion code executes
- Check for RLS policy blocking inserts
- Add proper error handling if insert fails

---

### 10. Token Refresh Skipped in Test Scripts
**Status:** Workaround in place
**Location:** `lib/integrations/hubspot.ts:30-34`

**Issue:**
When `supabaseClient` is provided to HubSpotIntegration constructor, token refresh is skipped. This is intentional for test scripts but could cause issues if token expires during long-running operations.

**Reproduction Steps:**
1. Run test script with expired token
2. First API call fails with expired token error
3. No automatic refresh happens

**Current Workaround:**
Manually refresh token before running scripts.

**Fix Needed:**
- Implement token refresh even with external Supabase client
- Pass refresh_token and client_id/secret to constructor
- Make refresh work in both contexts

---

## Flaky Behavior

### Salesforce OAuth Missing organization_id
**Location:** `app/api/integrations/oauth/salesforce/callback/route.ts:84-96`

**Issue:**
Salesforce callback inserts integration_connection without `organization_id` field, causing RLS to block or fail unpredictably.

**Sometimes works, sometimes fails** depending on RLS policy evaluation order.

**Fix:** Add organization_id lookup (same as HubSpot callback)

---

## Performance Issues

### Database Connection Pool Exhaustion
**Expected at:** 500-1000 concurrent users
**Impact:** "too many connections" errors, API routes fail

**Mitigation:**
- Enable Supabase connection pooling
- Upgrade to Supabase Pro (500 connections)
- Implement PgBouncer

---

### Webhook Processing Bottleneck
**Expected at:** 100+ concurrent calls ending
**Impact:** Webhooks timeout, duplicates created, Retell retries

**Mitigation:**
- Move to background job queue (Inngest/Trigger.dev)
- Return 200 OK immediately, process async
- Implement idempotency keys

---

## Test Coverage

**Current Test Coverage:** ~0%

No unit tests, integration tests, or E2E tests exist for:
- OAuth flows
- Webhook handlers
- Integration syncs
- RLS policies
- Token refresh logic

**Risk:** Changes can break production without detection.
