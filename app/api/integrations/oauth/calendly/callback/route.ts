import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/calendly/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/agents?error=oauth_failed&provider=calendly&reason=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=calendly&reason=missing_params', request.url)
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
      .eq('provider', 'calendly')
      .single();

    if (stateError || !oauthState) {
      console.error('[Calendly OAuth] State verification failed:', stateError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=calendly&reason=invalid_state', request.url)
      );
    }

    const { agent_id } = oauthState;

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CALENDLY_CLIENT_ID || '',
        client_secret: CALENDLY_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('[Calendly OAuth] Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=calendly&reason=token_exchange_failed', request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    console.log('[Calendly OAuth] Token exchange successful:', {
      has_access_token: !!access_token,
      has_refresh_token: !!refresh_token,
    });

    // Get user info from Calendly
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const userData = await userResponse.json();

    // Get agent's organization_id
    const { data: agent, error: agentError } = await serviceSupabase
      .from('agents')
      .select('organization_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('[Calendly OAuth] Failed to get agent:', agentError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=calendly&reason=agent_not_found', request.url)
      );
    }

    // Save to integration_connections
    const { error: insertError } = await serviceSupabase
      .from('integration_connections')
      .insert({
        agent_id,
        organization_id: agent.organization_id,
        integration_type: 'calendly',
        auth_type: 'oauth',
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        is_active: true,
        config: {
          user_uri: userData?.resource?.uri || null,
          scheduling_url: userData?.resource?.scheduling_url || null,
        },
      });

    if (insertError) {
      console.error('[Calendly OAuth] Failed to save connection:', insertError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=calendly&reason=save_failed', request.url)
      );
    }

    console.log('[Calendly OAuth] Connection saved successfully for agent:', agent_id);

    // Clean up state
    await serviceSupabase.from('oauth_states').delete().eq('state', state);

    // Redirect back to agent page
    return NextResponse.redirect(
      new URL(`/agents/${agent_id}?integration_connected=calendly`, request.url)
    );
  } catch (error: any) {
    console.error('[Calendly OAuth] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=calendly&reason=unexpected_error', request.url)
    );
  }
}
