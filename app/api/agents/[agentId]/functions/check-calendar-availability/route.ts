import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { google } from 'googleapis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { date, time, duration } = await request.json();

    if (!date || !time || !duration) {
      return NextResponse.json(
        { success: false, error: 'Date, time, and duration are required' },
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

    // Check for conflicts
    const response = await calendar.events.list({
      calendarId: integration.credentials.calendarId || 'primary',
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true
    });

    const conflictingEvents = response.data.items || [];
    const isAvailable = conflictingEvents.length === 0;

    return NextResponse.json({
      success: true,
      available: isAvailable,
      conflicting_events: conflictingEvents.map(event => ({
        summary: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime
      }))
    });

  } catch (error: any) {
    console.error('Error checking calendar availability:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check availability' },
      { status: 500 }
    );
  }
}
