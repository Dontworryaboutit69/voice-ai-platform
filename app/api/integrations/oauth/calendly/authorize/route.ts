import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/calendly/callback`;

export async function GET(request: NextRequest) {
  try {
    // Generate Calendly OAuth URL
    const authUrl = new URL('https://auth.calendly.com/oauth/authorize');
    authUrl.searchParams.set('client_id', CALENDLY_CLIENT_ID || '');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    // Redirect to Calendly OAuth
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Error generating Calendly OAuth URL:', error);
    return new NextResponse(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error.message}'}, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
