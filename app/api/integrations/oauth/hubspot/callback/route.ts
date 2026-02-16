import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * HubSpot OAuth Callback Endpoint
 * Handles the redirect from HubSpot after user authorizes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/agents?error=oauth_failed&provider=hubspot&reason=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=hubspot&reason=missing_params', request.url)
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Use service role to read oauth_states (bypasses RLS)
  const { createClient } = await import('@supabase/supabase-js');
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify state to prevent CSRF
  const { data: oauthState, error: stateError } = await serviceSupabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('provider', 'hubspot')
    .single();

  if (stateError || !oauthState) {
    console.error('[HubSpot OAuth] State verification failed:', {
      state,
      error: stateError,
      foundState: oauthState
    });
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=hubspot&reason=invalid_state', request.url)
    );
  }

  console.log('[HubSpot OAuth] State verified successfully:', {
    state,
    agent_id: oauthState.agent_id
  });

  const { agent_id, user_id } = oauthState;

  // Exchange code for access token
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=hubspot&reason=config_missing', request.url)
    );
  }

  try {
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[HubSpot OAuth] Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=hubspot&reason=token_exchange_failed', request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    console.log('[HubSpot OAuth] Token exchange successful:', {
      has_access_token: !!access_token,
      has_refresh_token: !!refresh_token,
      expires_in
    });

    // Get agent details to find organization_id
    const { data: agent, error: agentError } = await serviceSupabase
      .from('agents')
      .select('organization_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('[HubSpot OAuth] Failed to get agent:', agentError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=hubspot&reason=agent_not_found', request.url)
      );
    }

    console.log('[HubSpot OAuth] Agent organization_id:', agent.organization_id);

    // Store integration connection (use service role to bypass RLS issues)
    const { error: insertError } = await serviceSupabase
      .from('integration_connections')
      .insert({
        agent_id,
        organization_id: agent.organization_id,
        integration_type: 'hubspot',
        auth_type: 'oauth',
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        is_active: true,
        config: {},
      });

    if (insertError) {
      console.error('[HubSpot OAuth] Failed to save connection:', insertError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=hubspot&reason=save_failed', request.url)
      );
    }

    console.log('[HubSpot OAuth] Connection saved successfully for agent:', agent_id);

    // Clean up state
    await serviceSupabase.from('oauth_states').delete().eq('state', state);

    // Redirect back to agent page with success
    return NextResponse.redirect(
      new URL(`/agents/${agent_id}?integration_connected=hubspot`, request.url)
    );
  } catch (error) {
    console.error('[HubSpot OAuth] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=hubspot&reason=unexpected_error', request.url)
    );
  }
}
