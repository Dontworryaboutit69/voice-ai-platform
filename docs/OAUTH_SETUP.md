# OAuth Integration Setup Guide

This guide explains how to set up OAuth authentication for HubSpot and Salesforce so your users can connect their own accounts.

## Overview

The platform now has **production OAuth 2.0 authentication** for:
- ✅ HubSpot
- ✅ Salesforce

Users can click "Connect" in the Integrations tab, authorize via OAuth, and their accounts will be securely connected.

---

## Step 1: Register OAuth Applications

You need to create OAuth apps in HubSpot and Salesforce developer portals to get Client IDs and Secrets.

### HubSpot OAuth App Setup

1. **Go to HubSpot Developer Portal**
   - Visit: https://developers.hubspot.com/
   - Sign in with your HubSpot account (or create one)

2. **Create a New App**
   - Click "Create App"
   - Name: `[Your Platform Name] Integration`
   - Description: `Voice AI platform that syncs call data to HubSpot`

3. **Configure OAuth Settings**
   - Navigate to "Auth" tab
   - **Redirect URL**: `https://yourdomain.com/api/integrations/oauth/hubspot/callback`
     - For local development: `http://localhost:3000/api/integrations/oauth/hubspot/callback`
   - **Scopes**: Select these permissions:
     - `crm.objects.contacts.write`
     - `crm.objects.contacts.read`
     - `crm.objects.deals.write`
     - `crm.objects.deals.read`
     - `crm.schemas.contacts.read`
     - `crm.schemas.deals.read`

4. **Get Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret** (keep this secure!)

---

### Salesforce OAuth App Setup

1. **Go to Salesforce Setup**
   - Log in to Salesforce
   - Click the gear icon → Setup
   - In Quick Find, search for "App Manager"

2. **Create Connected App**
   - Click "New Connected App"
   - **Connected App Name**: `[Your Platform Name] Integration`
   - **API Name**: Auto-generated from name
   - **Contact Email**: Your email

3. **Enable OAuth Settings**
   - Check "Enable OAuth Settings"
   - **Callback URL**: `https://yourdomain.com/api/integrations/oauth/salesforce/callback`
     - For local development: `http://localhost:3000/api/integrations/oauth/salesforce/callback`
   - **Selected OAuth Scopes**: Add these:
     - `Full access (full)`
     - `Perform requests at any time (refresh_token, offline_access)`

4. **Get Credentials**
   - After saving, click "Manage Consumer Details"
   - Copy the **Consumer Key** (this is your Client ID)
   - Copy the **Consumer Secret** (this is your Client Secret)

---

## Step 2: Add Environment Variables

Add these credentials to your `.env.local` file (create it if it doesn't exist):

```bash
# HubSpot OAuth
HUBSPOT_CLIENT_ID=your_hubspot_client_id_here
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret_here
HUBSPOT_REDIRECT_URI=https://yourdomain.com/api/integrations/oauth/hubspot/callback

# Salesforce OAuth
SALESFORCE_CLIENT_ID=your_salesforce_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_salesforce_consumer_secret_here
SALESFORCE_REDIRECT_URI=https://yourdomain.com/api/integrations/oauth/salesforce/callback
```

### For Local Development

If testing locally, use:
```bash
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/integrations/oauth/hubspot/callback
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/integrations/oauth/salesforce/callback
```

### For Production (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable (name and value)
3. Select "Production" and "Preview" environments
4. Redeploy your app

---

## Step 3: Run Database Migration

The OAuth system needs a database table to store temporary state (for CSRF protection).

Run this migration:

```bash
cd voice-ai-platform
npx supabase migration up
```

Or manually run the SQL in Supabase Dashboard → SQL Editor:

```sql
-- See: supabase/migrations/20240215000000_oauth_states.sql
```

This creates the `oauth_states` table.

---

## Step 4: Test the OAuth Flow

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open an agent**: http://localhost:3000/agents/[agentId]

3. **Go to Integrations tab**

4. **Click "Connect" on HubSpot or Salesforce**
   - You'll be redirected to HubSpot/Salesforce login
   - Authorize the app
   - You'll be redirected back with success message

5. **Verify in database**:
   ```sql
   SELECT * FROM integration_connections WHERE integration_type = 'hubspot';
   ```
   - Should have `access_token`, `refresh_token`, `is_active = true`

---

## How It Works

### OAuth Flow

```
User clicks "Connect HubSpot"
  ↓
Platform redirects to:
  /api/integrations/oauth/hubspot/authorize?agent_id=xxx
  ↓
Creates state token in database (CSRF protection)
  ↓
Redirects user to HubSpot:
  https://app.hubspot.com/oauth/authorize?client_id=xxx&...
  ↓
User logs in to HubSpot and authorizes
  ↓
HubSpot redirects back to:
  /api/integrations/oauth/hubspot/callback?code=xxx&state=xxx
  ↓
Platform exchanges code for access_token
  ↓
Saves connection to database:
  - access_token
  - refresh_token
  - token_expires_at
  ↓
Redirects user back to agent page:
  /agents/[agentId]?integration_connected=hubspot
```

### Token Refresh

Tokens expire after a few hours. The platform automatically refreshes them:

```typescript
// Before each API call, check if token expired
if (token_expires_at < now + 5 minutes) {
  // Refresh token
  const newToken = await refreshHubSpotToken(refresh_token);
  // Update database
  await updateIntegrationToken(newToken);
}
```

This happens automatically in `lib/services/oauth-token-refresh.service.ts`.

---

## Security Notes

### CSRF Protection
- Every OAuth flow generates a random `state` token
- Stored in database with expiry (10 minutes)
- Verified when user returns from HubSpot/Salesforce
- Prevents attackers from initiating fake OAuth flows

### Token Storage
- Access tokens and refresh tokens stored in Supabase
- RLS policies ensure users only see their own tokens
- Tokens encrypted at rest by Supabase

### Environment Variables
- **NEVER commit `.env.local` to git**
- **NEVER expose Client Secrets in frontend code**
- Secrets are only used in server-side API routes

---

## Troubleshooting

### "OAuth not configured" error

**Problem**: Missing environment variables

**Solution**:
1. Check `.env.local` has all 6 variables
2. Restart dev server after adding variables
3. For Vercel: Check Environment Variables in dashboard

---

### "Invalid redirect URI" error

**Problem**: Redirect URI in OAuth app doesn't match environment variable

**Solution**:
1. HubSpot/Salesforce app settings must have EXACT redirect URI
2. Check for http vs https
3. Check for trailing slash (don't include one)
4. Make sure port matches (3000 for local dev)

---

### User authorizes but gets error on callback

**Problem**: Token exchange failed

**Solution**:
1. Check Client Secret is correct in `.env.local`
2. Check Supabase database is accessible
3. Check API route logs: `npm run dev` output
4. Verify `integration_connections` table exists

---

### "Invalid state" error

**Problem**: State token expired or doesn't exist

**Solution**:
1. Make sure database migration ran
2. Check `oauth_states` table exists
3. Try again (state expires after 10 minutes)

---

## Production Checklist

Before going live:

- [ ] OAuth apps approved in HubSpot/Salesforce (not in development mode)
- [ ] Production redirect URIs added to OAuth apps
- [ ] Environment variables set in Vercel
- [ ] Database migration run on production Supabase
- [ ] SSL certificate valid (https://)
- [ ] Test OAuth flow on production domain
- [ ] Monitor error logs for failed token refreshes

---

## Next Steps

### Multi-Tenant Considerations

If you have multiple organizations/workspaces:

1. Each organization can connect their own HubSpot/Salesforce
2. OAuth credentials (Client ID/Secret) are shared across all users
3. Access tokens and refresh tokens are unique per user
4. RLS policies ensure users only see their own connections

### Additional OAuth Providers

To add Google Calendar, Calendly, or other OAuth providers:

1. Copy the HubSpot OAuth route pattern
2. Update provider-specific URLs and scopes
3. Add environment variables
4. Update IntegrationModal.tsx to support new provider

---

## Support

If you need help:

1. Check API route logs: `npm run dev` output shows detailed OAuth flow
2. Check Supabase logs: Dashboard → Logs
3. Enable verbose logging in `oauth-token-refresh.service.ts`
4. Test with a fresh account (clear cookies/cache)

---

## Files Created

OAuth implementation consists of:

```
app/api/integrations/oauth/
├── hubspot/
│   ├── authorize/route.ts    # Initiate HubSpot OAuth
│   └── callback/route.ts      # Handle HubSpot callback
└── salesforce/
    ├── authorize/route.ts     # Initiate Salesforce OAuth
    └── callback/route.ts      # Handle Salesforce callback

lib/services/
└── oauth-token-refresh.service.ts   # Auto-refresh expired tokens

supabase/migrations/
└── 20240215000000_oauth_states.sql  # State tracking table

app/agents/[agentId]/components/
└── IntegrationModal.tsx             # Updated to use OAuth
```

---

**That's it!** Your users can now connect their HubSpot and Salesforce accounts via secure OAuth 2.0 authentication. 🎉
