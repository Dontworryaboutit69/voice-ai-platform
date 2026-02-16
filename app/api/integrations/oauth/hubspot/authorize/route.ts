import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * HubSpot OAuth Authorization Endpoint
 * Redirects user to HubSpot login to authorize access
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agent_id');
  const state = searchParams.get('state') || Math.random().toString(36).substring(7);

  if (!agentId) {
    return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
  }

  // Check environment variables
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'HubSpot OAuth not configured. Please set HUBSPOT_CLIENT_ID and HUBSPOT_REDIRECT_URI environment variables.'
    }, { status: 500 });
  }

  // Required scopes for HubSpot integration
  const scopes = [
    'crm.objects.contacts.write',
    'crm.objects.contacts.read',
    'crm.objects.deals.write',
    'crm.objects.deals.read',
    'crm.schemas.contacts.read',
    'crm.schemas.deals.read',
  ].join(' ');

  // Store state in session for CSRF protection
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Use service role to bypass RLS for oauth_states (internal security table)
  const { createClient } = await import('@supabase/supabase-js');
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Store state temporarily in database
  const { error: stateError } = await serviceSupabase.from('oauth_states').insert({
    state,
    agent_id: agentId,
    user_id: user?.id || null, // NULL if no user logged in
    provider: 'hubspot',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
  });

  if (stateError) {
    console.error('[HubSpot OAuth] Failed to store state:', stateError);
    return NextResponse.json({
      error: 'Failed to initialize OAuth flow',
      details: stateError.message
    }, { status: 500 });
  }

  console.log('[HubSpot OAuth] State stored successfully:', { state, agent_id: agentId });

  // Build HubSpot authorization URL
  const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
