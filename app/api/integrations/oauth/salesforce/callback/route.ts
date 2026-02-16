import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Salesforce OAuth Callback Endpoint
 * Handles the redirect from Salesforce after user authorizes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/agents?error=oauth_failed&provider=salesforce&reason=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=salesforce&reason=missing_params', request.url)
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Verify state to prevent CSRF
  const { data: oauthState, error: stateError } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('provider', 'salesforce')
    .single();

  if (stateError || !oauthState) {
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=salesforce&reason=invalid_state', request.url)
    );
  }

  const { agent_id, user_id } = oauthState;

  // Exchange code for access token
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=salesforce&reason=config_missing', request.url)
    );
  }

  try {
    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
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
      console.error('[Salesforce OAuth] Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=salesforce&reason=token_exchange_failed', request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, instance_url } = tokens;

    // Store integration connection
    const { error: insertError } = await supabase
      .from('integration_connections')
      .insert({
        agent_id,
        integration_type: 'salesforce',
        access_token,
        refresh_token,
        is_active: true,
        config: {
          instance_url, // Salesforce instance URL (e.g., https://yourorg.salesforce.com)
          create_as: 'Lead', // Default to creating Leads
        },
      });

    if (insertError) {
      console.error('[Salesforce OAuth] Failed to save connection:', insertError);
      return NextResponse.redirect(
        new URL('/agents?error=oauth_failed&provider=salesforce&reason=save_failed', request.url)
      );
    }

    // Clean up state
    await supabase.from('oauth_states').delete().eq('state', state);

    // Redirect back to agent page with success
    return NextResponse.redirect(
      new URL(`/agents/${agent_id}?integration_connected=salesforce`, request.url)
    );
  } catch (error) {
    console.error('[Salesforce OAuth] Unexpected error:', error);
    return NextResponse.redirect(
      new URL('/agents?error=oauth_failed&provider=salesforce&reason=unexpected_error', request.url)
    );
  }
}
