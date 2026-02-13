import { NextRequest, NextResponse } from 'next/server';

const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/gohighlevel/callback`;

export async function GET(request: NextRequest) {
  try {
    // Generate GoHighLevel OAuth URL
    const authUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
    authUrl.searchParams.set('client_id', GHL_CLIENT_ID || '');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', 'contacts.write contacts.readonly calendars.write calendars.readonly opportunities.write opportunities.readonly');

    // Redirect to GHL OAuth
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Error generating GHL OAuth URL:', error);
    return new NextResponse(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error.message}'}, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
