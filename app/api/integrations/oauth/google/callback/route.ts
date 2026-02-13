import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/oauth/google/callback`;

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

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Get user's email and calendar info
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();

    const credentials = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      calendarId: 'primary',
      calendars: calendarList.data.items?.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary
      }))
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
    console.error('Error in Google OAuth callback:', error);
    return new NextResponse(
      `<html><body><script>window.opener.postMessage({type: 'oauth_error', error: '${error.message}'}, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
