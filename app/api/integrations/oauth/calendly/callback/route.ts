import { NextRequest, NextResponse } from 'next/server';

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/calendly/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return new NextResponse(
        `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error}'}, '*'); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      return new NextResponse(
        `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: 'No authorization code received'}, '*'); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

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
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userData = await userResponse.json();

    const credentials = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      userUri: userData.resource.uri,
      schedulingUrl: userData.resource.scheduling_url
    };

    // Send success message to parent window
    return new NextResponse(
      `<html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'oauth_success',
              credentials: ${JSON.stringify(credentials)}
            }, '*');
            window.close();
          </script>
          <div style="font-family: system-ui; text-align: center; padding: 40px;">
            <h2 style="color: #22c55e;">✓ Connected Successfully!</h2>
            <p style="color: #64748b;">This window will close automatically...</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: any) {
    console.error('Error in Calendly OAuth callback:', error);
    return new NextResponse(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error.message}'}, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
