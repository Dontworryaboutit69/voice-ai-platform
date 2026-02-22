import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/agents?error=oauth_failed&provider=google&reason=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=google&reason=missing_params', request.url)
      );
    }

    // Verify state
    const { createClient } = await import('@supabase/supabase-js');
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: oauthState, error: stateError } = await serviceSupabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'google')
      .single();

    if (stateError || !oauthState) {
      console.error('[Google OAuth] State verification failed:', stateError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=google&reason=invalid_state', request.url)
      );
    }

    const { agent_id } = oauthState;

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    console.log('[Google OAuth] Token exchange successful:', {
      has_access_token: !!access_token,
      has_refresh_token: !!refresh_token,
    });

    // Get agent's organization_id
    const { data: agent, error: agentError } = await serviceSupabase
      .from('agents')
      .select('organization_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('[Google OAuth] Failed to get agent:', agentError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=google&reason=agent_not_found', request.url)
      );
    }

    // Save to integration_connections
    const { error: insertError } = await serviceSupabase
      .from('integration_connections')
      .insert({
        agent_id,
        organization_id: agent.organization_id,
        integration_type: 'google_calendar',
        auth_type: 'oauth',
        access_token,
        refresh_token,
        token_expires_at: expiry_date ? new Date(expiry_date).toISOString() : null,
        is_active: true,
        config: {},
      });

    if (insertError) {
      console.error('[Google OAuth] Failed to save connection:', insertError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=google&reason=save_failed', request.url)
      );
    }

    console.log('[Google OAuth] Connection saved successfully for agent:', agent_id);

    // Clean up state
    await serviceSupabase.from('oauth_states').delete().eq('state', state);

    // Redirect back to agent page
    return NextResponse.redirect(
      new URL(`/agents/${agent_id}?integration_connected=google_calendar`, request.url)
    );
  } catch (error: any) {
    console.error('[Google OAuth] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=google&reason=unexpected_error', request.url)
    );
  }
}
