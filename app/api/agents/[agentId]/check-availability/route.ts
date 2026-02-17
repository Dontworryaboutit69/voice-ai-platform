import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  console.log('[check-availability] ROUTE HIT - START');
  try {
    const { agentId } = await params;
    console.log('[check-availability] agentId from params:', agentId);
    const body = await request.json();
    const { date, timezone = 'America/New_York', execution_message } = body;
    console.log('[check-availability] Request body:', JSON.stringify(body));

    console.log(`[check-availability] Request for agent ${agentId}, date: ${date}, timezone: ${timezone}`);

    const supabase = createServiceClient();

    // Get active calendar integration for this agent
    const { data: integration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('[check-availability] No active calendar integration found:', integrationError);
      return NextResponse.json({
        error: 'No calendar integration configured',
        message: 'I apologize, but I'\''m unable to access the calendar right now. Please call our office directly to schedule.'
      }, { status: 400 });
    }

    console.log(`[check-availability] Found ${integration.integration_type} integration`);

    // Route to appropriate calendar provider
    if (integration.integration_type === 'gohighlevel') {
      return await checkGHLAvailability(integration, date, timezone);
    } else if (integration.integration_type === 'google_calendar') {
      return await checkGoogleCalendarAvailability(integration, date, timezone);
    }

    return NextResponse.json({
      error: 'Unsupported calendar type',
      message: 'I apologize, but I'\''m unable to access the calendar right now.'
    }, { status: 400 });

  } catch (error: any) {
    console.error('[check-availability] Error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to check availability',
      message: 'I apologize, but I'\''m having trouble checking the calendar right now. Let me take down your information and have someone call you back to schedule.'
    }, { status: 500 });
  }
}

async function checkGHLAvailability(integration: any, date: string, timezone: string) {
  try {
    const { calendar_id, location_id } = integration.config || {};

    if (!calendar_id || !location_id) {
      console.error('[check-availability] Missing calendar_id or location_id in config');
      return NextResponse.json({
        error: 'Calendar not configured',
        message: 'I apologize, but the calendar isn'\''t fully set up yet. Please contact our office directly.'
      }, { status: 400 });
    }

    console.log(`[check-availability] Checking GHL calendar ${calendar_id} for date ${date}`);

    // Call GoHighLevel Calendar API to get free slots
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/${calendar_id}/free-slots?startDate=${date}&endDate=${date}&timezone=${encodeURIComponent(timezone)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.api_key}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[check-availability] GHL API error:', response.status, errorText);

      return NextResponse.json({
        error: 'Failed to fetch calendar slots',
        message: 'I'\''m having trouble accessing the calendar right now. Let me take your information and have our scheduler call you back within an hour to confirm your appointment.'
      }, { status: response.status });
    }

    const data = await response.json();
    console.log(`[check-availability] GHL response:`, JSON.stringify(data, null, 2));

    // Format the available slots for the agent
    if (!data.slots || data.slots.length === 0) {
      return NextResponse.json({
        available: false,
        slots: [],
        message: `I don'\''t see any available times on ${date}. Would another day work better for you?`
      });
    }

    // Extract just the times for easier communication
    const availableTimes = data.slots.map((slot: any) => {
      const time = new Date(slot.startTime);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
      });
    });

    return NextResponse.json({
      available: true,
      date,
      timezone,
      slots: availableTimes,
      raw_slots: data.slots,
      message: `I have the following times available on ${new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })}: ${availableTimes.slice(0, 5).join(', ')}${availableTimes.length > 5 ? `, and ${availableTimes.length - 5} more times` : ''}.`
    });

  } catch (error: any) {
    console.error('[check-availability] GHL error:', error);
    return NextResponse.json({
      error: error.message,
      message: 'I'\''m having trouble checking availability right now. Let me take your information and I'\''ll have our scheduler call you back within the hour.'
    }, { status: 500 });
  }
}

async function checkGoogleCalendarAvailability(integration: any, date: string, timezone: string) {
  try {
    // TODO: Implement Google Calendar availability checking
    // Will need to use Google Calendar API with the stored access/refresh tokens

    console.log('[check-availability] Google Calendar not yet implemented');

    return NextResponse.json({
      error: 'Google Calendar integration coming soon',
      message: 'I apologize, but I'\''m unable to access the Google Calendar right now. Let me take your information and have someone call you back to schedule.'
    }, { status: 501 });

  } catch (error: any) {
    console.error('[check-availability] Google Calendar error:', error);
    return NextResponse.json({
      error: error.message,
      message: 'I'\''m having trouble checking availability right now.'
    }, { status: 500 });
  }
}
