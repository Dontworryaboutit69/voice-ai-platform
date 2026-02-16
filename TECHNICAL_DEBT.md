# Technical Debt

This document tracks shortcuts we've taken and need to address before scaling to production.

## 🔴 Critical Technical Debt (Fix Before Launch)

### 1. Service Role Key Used Everywhere
**Locations:**
- `app/api/integrations/oauth/hubspot/authorize/route.ts:43-48`
- `app/api/integrations/oauth/hubspot/callback/route.ts:30-35, 107`
- `app/api/integrations/oauth/salesforce/callback/route.ts`
- `app/api/webhooks/retell/call-events/route.ts:85`
- `lib/integrations/integration-factory.ts:343, 400`

**Why It's Debt:**
The service role key (`SUPABASE_SERVICE_ROLE_KEY`) bypasses ALL Row-Level Security policies. We're using it to work around RLS issues instead of fixing the policies properly.

**Security Risk:**
- If this key leaks, attacker has full database access
- No per-request authorization checks
- Violates principle of least privilege
- Makes audit logs useless

**Proper Solution:**
1. Fix RLS policies to work with server client (no service role)
2. Use service role ONLY for internal background jobs
3. Implement proper request-based authentication for OAuth flows
4. Add authorization checks before database operations

**Estimated Fix Time:** 2-3 days

---

### 2. OAuth Tokens Stored Unencrypted
**Locations:**
- `integration_connections` table columns: `access_token`, `refresh_token`, `api_key`, `api_secret`

**Why It's Debt:**
Quick MVP approach - stored tokens as plain text to move fast. This is a compliance and security disaster waiting to happen.

**Security Risk:**
- Database breach = all customer CRMs compromised
- GDPR violation (Article 32 - appropriate security measures)
- SOC 2 compliance failure
- Legal liability if tokens are exposed

**Proper Solution:**
1. Add encryption layer using AES-256-GCM
2. Store encryption keys in Supabase Vault or AWS KMS
3. Encrypt before insert, decrypt on read
4. Rotate encryption keys quarterly
5. Add audit log for token access

**Estimated Fix Time:** 1 week (including key management setup)

---

### 3. No Webhook Signature Verification
**Locations:**
- `app/api/webhooks/retell/call-events/route.ts`
- `app/api/webhooks/retell/sync-calls/route.ts`
- `app/api/webhooks/retell/configure/route.ts`

**Why It's Debt:**
Webhooks were implemented quickly to get integrations working. Skipped signature verification to avoid complexity.

**Security Risk:**
- Anyone can trigger fake calls
- Attacker can spam database with fake data
- Can trigger expensive AI analysis on fake transcripts
- CRM integrations can be abused (spam customer HubSpots)
- No way to prove data came from Retell

**Proper Solution:**
1. Implement Retell webhook signature verification
2. Use `x-retell-signature` header (HMAC-SHA256)
3. Add webhook secret to environment variables
4. Reject unsigned requests
5. Add replay attack prevention (timestamp validation)

**Estimated Fix Time:** 1 day

---

### 4. No Authorization Checks on OAuth Callbacks
**Locations:**
- `app/api/integrations/oauth/hubspot/callback/route.ts`
- `app/api/integrations/oauth/salesforce/callback/route.ts`
- `app/api/integrations/oauth/google/callback/route.ts`

**Why It's Debt:**
OAuth callbacks verify the state token exists but don't check if the current user has permission to complete OAuth for the agent.

**Security Risk:**
- User A can initiate OAuth for User B's agent
- User A completes OAuth with their own HubSpot
- User B's calls now sync to User A's HubSpot (data breach)

**Attack Scenario:**
```
1. Attacker gets victim's agent ID (from public URL or guess)
2. Attacker initiates OAuth for victim's agent
3. Attacker receives state token
4. Attacker completes OAuth with attacker's HubSpot account
5. Victim's customer data now flows to attacker's CRM
```

**Proper Solution:**
1. Store `user_id` and `organization_id` in oauth_states
2. On callback, verify current user matches stored user_id
3. Check user is member of agent's organization
4. Add agent ownership validation before completing OAuth

**Estimated Fix Time:** 1 day

---

## 🟡 High Priority Technical Debt (Fix Before 1,000 Users)

### 5. AI Manager Always Runs (No Opt-In)
**Location:** `app/api/webhooks/retell/call-events/route.ts:159`

**Why It's Debt:**
To demo AI Manager feature quickly, we made it run on every call. Never added the opt-in toggle.

**Cost Impact:**
- Claude API: ~$0.01 per call analyzed
- At 10,000 calls/day: $100/day = $36,500/year
- Runs even during free trial (no revenue)
- No way for customers to disable if they don't want it

**Proper Solution:**
1. Add `ai_manager_enabled` boolean to agents table
2. Check flag before calling `evaluateCallAsync()`
3. Make it opt-in in UI (default: false)
4. Add usage tracking for AI Manager separately from calls
5. Consider tiered pricing (Basic = no AI Manager, Pro = AI Manager)

**Estimated Fix Time:** 2 hours

---

### 6. No Rate Limiting Anywhere
**Locations:** All public API routes

**Why It's Debt:**
MVP didn't need rate limiting with few test users. Skipped to save time.

**Security Risk:**
- Webhook endpoint can be DDoSed
- Expensive operations (AI analysis) can be triggered repeatedly
- Supabase database fills up → bill skyrockets
- No protection against brute force attacks

**Cost Impact:**
- Single malicious actor could cost $10,000+ in a day
- Database storage charges for spam data
- API quota exhaustion (Claude, Retell)

**Proper Solution:**
1. Add rate limiting middleware (Upstash Redis or Vercel built-in)
2. Limits per endpoint:
   - Webhooks: 100/minute per IP
   - OAuth: 10/minute per user
   - Test calls: 5/minute per user
3. Add exponential backoff for repeated violations
4. Return 429 Too Many Requests with Retry-After header

**Estimated Fix Time:** 1 day

---

### 7. No Background Job Queue
**Location:** `app/api/webhooks/retell/call-events/route.ts:159-178`

**Why It's Debt:**
Integration sync and AI analysis run inline with webhook handler (fire-and-forget async). This causes:
- Webhook timeouts if processing takes >5 seconds
- Lost jobs if server crashes during processing
- No retry mechanism
- Can't track job status

**Current Pattern:**
```typescript
syncToIntegrationsAsync().catch(error => {
  console.error('Failed:', error);
  // Error is swallowed, no retry, no alert
});
```

**Scaling Problem:**
At 100 concurrent calls:
- HubSpot API calls take 500ms each
- All 100 try to run at once
- Some hit rate limits
- Some timeout
- Retell retries webhook
- Creates duplicate records

**Proper Solution:**
1. Implement job queue (Inngest, Trigger.dev, or BullMQ)
2. Webhook returns 200 OK immediately
3. Queue job for integration sync
4. Separate workers process jobs
5. Automatic retries with exponential backoff
6. Job status tracking in database
7. Dead letter queue for failed jobs

**Estimated Fix Time:** 3-4 days

---

### 8. Database Schema Not Normalized
**Issues:**
- `transcript_object` stored as JSONB (should be separate `transcript_messages` table)
- `call_analysis` stored as JSONB (should be structured fields)
- No foreign key constraints on some relationships
- Missing indexes on frequently queried fields

**Why It's Debt:**
Rapid prototyping phase - used JSONB to avoid schema changes.

**Performance Impact:**
- Can't query transcript content efficiently
- Can't aggregate analysis metrics
- Full table scans on queries
- Index bloat from JSONB

**Proper Solution:**
1. Create `transcript_messages` table (call_id, sequence, role, content, timestamp)
2. Create `call_analysis_metrics` table (structured fields for sentiment, topics, etc.)
3. Add missing foreign key constraints
4. Add indexes: agent_id, created_at, call_status, organization_id
5. Migrate existing data

**Estimated Fix Time:** 1 week

---

## 🟠 Medium Priority Technical Debt (Fix Before 10,000 Users)

### 9. No Cost Monitoring or Alerts
**Why It's Debt:**
No limits on:
- Claude API usage (could hit rate limit or run up huge bill)
- Retell call minutes (unlimited during testing)
- Supabase storage/egress (recordings could cost thousands)
- Integration API calls (HubSpot rate limits)

**Financial Risk:**
- Bad actor or bug could cost $50,000+ in a month
- No alerts when approaching budget limits
- Can't predict monthly costs accurately

**Proper Solution:**
1. Add usage tracking for all external services
2. Set up cost alerts (AWS CloudWatch, Datadog, or custom)
3. Implement per-customer usage quotas
4. Add "soft limits" that trigger alerts
5. Add "hard limits" that pause service at thresholds
6. Dashboard showing cost per customer

**Estimated Fix Time:** 3 days

---

### 10. No Error Tracking or Observability
**Current State:**
- Console.log everywhere
- No centralized error tracking
- No performance monitoring
- No alert system
- Can't debug production issues

**Why It's Debt:**
Works fine with 10 test users, but breaks down at scale.

**Proper Solution:**
1. Add Sentry for error tracking
2. Add structured logging (Winston or Pino)
3. Add performance monitoring (New Relic or Datadog)
4. Set up alerts for critical errors
5. Add health check endpoints
6. Dashboard for system health

**Estimated Fix Time:** 2 days

---

### 11. Zero Test Coverage
**Current State:**
- No unit tests
- No integration tests
- No E2E tests
- Manual testing only

**Why It's Debt:**
MVP speed - writing code faster than writing tests.

**Risk:**
- Changes break production
- Can't refactor safely
- Bug regression
- New developers can't verify changes

**Proper Solution:**
1. Add Jest/Vitest for unit tests
2. Add Playwright for E2E tests
3. Test critical paths:
   - OAuth flows
   - Webhook handlers
   - Integration syncs
   - RLS policies
4. CI/CD runs tests on every commit
5. Minimum 70% coverage for new code

**Estimated Fix Time:** 2 weeks (ongoing)

---

## 🟢 Low Priority Technical Debt (Nice to Have)

### 12. TypeScript `any` Usage
**Locations:** Throughout codebase

**Why It's Debt:**
Used `any` to move fast, sacrificing type safety.

**Issues:**
- No compile-time error checking
- IDE autocomplete doesn't work
- Runtime type errors possible

**Fix:** Gradually replace `any` with proper types

---

### 13. No API Versioning
**Current State:** `/api/webhooks/retell/call-events` has no version

**Why It's Debt:**
Breaking changes would affect all clients at once.

**Fix:** Add versioning: `/api/v1/webhooks/...`

---

### 14. Environment Variables Not Validated
**Current State:** App starts even if critical env vars are missing

**Why It's Debt:**
Causes runtime errors instead of startup errors.

**Fix:** Use Zod to validate env vars on startup

---

### 15. No Database Backup Strategy
**Current State:** Relying on Supabase automatic backups only

**Why It's Debt:**
No tested restore procedure, no point-in-time recovery strategy.

**Fix:**
- Weekly manual backup exports
- Test restore procedure quarterly
- Document recovery playbook

---

## Refactoring Needed

### File Size Issues
- `app/api/webhooks/retell/call-events/route.ts` (637 lines) - Split into services
- `lib/integrations/integration-factory.ts` (429 lines) - Extract sync logic

### Missing Abstractions
- No repository layer (data access mixed with business logic)
- No service layer (API routes do everything)
- No dependency injection (hard to test)

---

## Shortcuts Taken

### 1. OAuth State in Database
**Better Approach:** Use Redis (expires automatically, faster, no cleanup needed)

### 2. Fire-and-Forget Async
**Better Approach:** Job queue with retry and monitoring

### 3. Google OAuth via postMessage
**Better Approach:** Server-side flow, store in database like HubSpot

### 4. Integration Factory Uses Cookies in Webhooks
**Better Approach:** Pass Supabase client or use service role only for webhooks

---

## Priority Matrix

```
High Impact + High Effort:
- Service role key replacement (2-3 days)
- Token encryption (1 week)
- Background job queue (3-4 days)

High Impact + Low Effort:
- Webhook signature verification (1 day)
- AI Manager opt-in (2 hours)
- Authorization checks (1 day)

Low Impact + High Effort:
- Database normalization (1 week)
- Full test coverage (2 weeks)

Low Impact + Low Effort:
- Rate limiting (1 day)
- Error tracking setup (2 days)
- TypeScript strict mode (ongoing)
```

---

## Estimated Total Fix Time

**Must Fix Before Launch (Critical):** 1-2 weeks
**Should Fix Before 1K Users (High):** 2-3 weeks
**Should Fix Before 10K Users (Medium):** 3-4 weeks

**Total:** ~2 months of focused engineering work to resolve all technical debt.
