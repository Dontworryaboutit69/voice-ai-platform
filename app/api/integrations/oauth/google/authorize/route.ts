import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agent_id');
    const state = searchParams.get('state') || Math.random().toString(36).substring(7);

    if (!agentId) {
      return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
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
      provider: 'google',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (stateError) {
      console.error('[Google OAuth] Failed to store state:', stateError);
      return NextResponse.json({ error: 'Failed to initialize OAuth flow' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      prompt: 'consent',
      state,
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
