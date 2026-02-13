import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { google } from 'googleapis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { date, time, duration, title, description, attendeeEmail } = await request.json();

    if (!date || !time || !duration || !title) {
      return NextResponse.json(
        { success: false, error: 'Date, time, duration, and title are required' },
        { status: 400 }
      );
    }

    // Get Google Calendar integration credentials
    const supabase = createServiceClient();
    const { data: integration } = await supabase
      .from('agent_integrations')
      .select('credentials, settings')
      .eq('agent_id', agentId)
      .eq('integration_type', 'google-calendar')
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Google Calendar integration not configured' },
        { status: 400 }
      );
    }

    // Initialize Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      integration.credentials.clientId,
      integration.credentials.clientSecret
    );

    oauth2Client.setCredentials({
      access_token: integration.credentials.accessToken,
      refresh_token: integration.credentials.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Calculate time window
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // Create event
    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Los_Angeles' // TODO: Make this configurable
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }
        ]
      },
      sendNotifications: integration.settings.sendConfirmation || true
    };

    const response = await calendar.events.insert({
      calendarId: integration.credentials.calendarId || 'primary',
      requestBody: event,
      sendUpdates: integration.settings.sendConfirmation ? 'all' : 'none'
    });

    return NextResponse.json({
      success: true,
      event_id: response.data.id,
      event_link: response.data.htmlLink,
      confirmation_sent: integration.settings.sendConfirmation
    });

  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
