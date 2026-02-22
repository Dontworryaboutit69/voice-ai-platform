import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/calendly/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agent_id');
    const state = searchParams.get('state') || Math.random().toString(36).substring(7);

    if (!agentId) {
      return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
    }

    if (!CALENDLY_CLIENT_ID) {
      return NextResponse.json({ error: 'Calendly OAuth not configured' }, { status: 500 });
    }

    // Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Store state in DB for CSRF protection
    const { createClient } = await import('@supabase/supabase-js');
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: stateError } = await serviceSupabase.from('oauth_states').insert({
      state,
      agent_id: agentId,
      user_id: user?.id || null,
      provider: 'calendly',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (stateError) {
      console.error('[Calendly OAuth] Failed to store state:', stateError);
      return NextResponse.json({ error: 'Failed to initialize OAuth flow' }, { status: 500 });
    }

    // Generate Calendly OAuth URL
    const authUrl = new URL('https://auth.calendly.com/oauth/authorize');
    authUrl.searchParams.set('client_id', CALENDLY_CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Error generating Calendly OAuth URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
