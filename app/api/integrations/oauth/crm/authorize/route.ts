import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import crypto from 'crypto';

const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://voice-ai-platform-phi.vercel.app';
const REDIRECT_URI = `${APP_URL}/api/integrations/oauth/crm/callback`;

// All scopes we registered in the GHL Marketplace
const SCOPES = [
  'contacts.readonly',
  'contacts.write',
  'conversations.readonly',
  'conversations.write',
  'conversations/livechat.write',
  'calendars.readonly',
  'calendars.write',
  'calendars/events.readonly',
  'calendars/events.write',
  'locations.readonly',
  'locations/customFields.readonly',
  'locations/customValues.readonly',
  'opportunities.readonly',
  'opportunities.write',
  'workflows.readonly',
  'users.readonly',
  'oauth.readonly',
  'oauth.write',
].join(' ');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agent_id');
    const organizationId = searchParams.get('organization_id');

    if (!GHL_CLIENT_ID) {
      console.error('[GHL OAuth] Missing GHL_CLIENT_ID');
      return new NextResponse('OAuth not configured', { status: 500 });
    }

    if (!agentId) {
      return new NextResponse('Missing agent_id parameter', { status: 400 });
    }

    // Generate CSRF state token
    const stateToken = crypto.randomBytes(32).toString('hex');

    // Store state in oauth_states table for validation in callback
    const supabase = createServiceClient();
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state: stateToken,
        integration_type: 'gohighlevel',
        agent_id: agentId,
        organization_id: organizationId || null,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
        metadata: { redirect_uri: REDIRECT_URI },
      });

    if (stateError) {
      console.error('[GHL OAuth] Failed to store state:', stateError);
      return new NextResponse('Failed to initialize OAuth flow', { status: 500 });
    }

    // Build the GHL OAuth authorization URL
    const authUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('client_id', GHL_CLIENT_ID);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', stateToken);

    console.log('[GHL OAuth] Redirecting to GHL authorization:', authUrl.toString().substring(0, 200));

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('[GHL OAuth] Error in authorize:', error);
    return new NextResponse(
      `<html><body>
        <div style="font-family: system-ui; text-align: center; padding: 40px;">
          <h2 style="color: #ef4444;">Connection Error</h2>
          <p style="color: #64748b;">Failed to start the connection process. Please try again.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth_error', error: '${error.message}' }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
