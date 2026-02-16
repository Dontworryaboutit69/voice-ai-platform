import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Salesforce OAuth Authorization Endpoint
 * Redirects user to Salesforce login to authorize access
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agent_id');
  const state = searchParams.get('state') || Math.random().toString(36).substring(7);

  if (!agentId) {
    return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
  }

  // Check environment variables
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'Salesforce OAuth not configured. Please set SALESFORCE_CLIENT_ID and SALESFORCE_REDIRECT_URI environment variables.'
    }, { status: 500 });
  }

  // Store state in session for CSRF protection
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Store state temporarily in database
  // Use user.id if available, otherwise use a placeholder (for now)
  await supabase.from('oauth_states').insert({
    state,
    agent_id: agentId,
    user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Temporary: use placeholder if no user
    provider: 'salesforce',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
  });

  // Build Salesforce authorization URL
  // Note: Use login.salesforce.com for production, test.salesforce.com for sandbox
  const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'api refresh_token');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
