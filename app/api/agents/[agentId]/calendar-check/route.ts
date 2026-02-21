import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// Calendar integration types that support availability checking
const CALENDAR_TYPES = ['gohighlevel', 'google_calendar', 'cal_com', 'calendly'];

/**
 * Convert 24h time slots (HH:MM) to 12h format for the voice agent
 */
function formatSlotsTo12h(slots: string[]): string[] {
  return slots.map(slot => {
    const [hour, minute] = slot.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { date, timezone = 'America/New_York' } = body;

    console.log(`[calendar-check] Checking availability for agent ${agentId}, date: ${date}`);

    // Validate date is not in the past
    if (date) {
      const requestedDate = new Date(date + 'T23:59:59');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (requestedDate < today) {
        console.log(`[calendar-check] Rejecting past date: ${date}`);
        return NextResponse.json({
          success: false,
          error: `The date ${date} is in the past. Please provide a future date.`,
          slots: []
        }, { status: 200 });
      }
    }

    const supabase = createServiceClient();

    // Get active calendar integration (supports GHL, Google Calendar, Cal.com, Calendly)
    const { data: integrations, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .in('integration_type', CALENDAR_TYPES);

    if (integrationError || !integrations || integrations.length === 0) {
      console.error('[calendar-check] No active calendar integration:', integrationError);
      return NextResponse.json(
        { success: false, error: 'No calendar integration configured', slots: [] },
        { status: 200 }
      );
    }

    // Pick the first active calendar integration (priority: order they were created)
    const integration = integrations[0];
    console.log(`[calendar-check] Found ${integration.integration_type} integration`);

    // Handle GoHighLevel
    if (integration.integration_type === 'gohighlevel') {
      try {
        console.log('[calendar-check] Fetching real availability from GHL for date:', date);

        const { GoHighLevelIntegration } = await import('@/lib/integrations/gohighlevel');
        const ghl = new GoHighLevelIntegration(integration);

        const result = await ghl.checkAvailability(date, timezone);

        if (!result.success) {
          console.error('[calendar-check] GHL availability check failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to check availability', slots: [] },
            { status: 200 }
          );
        }

        const slots = formatSlotsTo12h(result.data?.availableSlots || []);
        console.log(`[calendar-check] Returning ${slots.length} available slots from GHL`);

        return NextResponse.json({ success: true, slots, date, timezone });
      } catch (error: any) {
        console.error('[calendar-check] GHL error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable', slots: [] },
          { status: 200 }
        );
      }
    }

    // Handle Google Calendar
    if (integration.integration_type === 'google_calendar') {
      try {
        // Refresh token before use
        const { ensureValidToken } = await import('@/lib/services/oauth-token-refresh.service');
        const validToken = await ensureValidToken(integration.id, 'google_calendar');
        if (validToken) {
          integration.access_token = validToken;
        }

        const { GoogleCalendarIntegration } = await import('@/lib/integrations/google-calendar');
        const gcal = new GoogleCalendarIntegration(integration);
        const result = await gcal.checkAvailability(date, timezone);

        if (!result.success) {
          console.error('[calendar-check] Google Calendar check failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to check availability', slots: [] },
            { status: 200 }
          );
        }

        const slots = formatSlotsTo12h(result.data?.availableSlots || []);
        console.log(`[calendar-check] Returning ${slots.length} available slots from Google Calendar`);

        return NextResponse.json({ success: true, slots, date, timezone });
      } catch (error: any) {
        console.error('[calendar-check] Google Calendar error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable', slots: [] },
          { status: 200 }
        );
      }
    }

    // Handle Cal.com
    if (integration.integration_type === 'cal_com') {
      try {
        const { CalComIntegration } = await import('@/lib/integrations/cal-com');
        const calcom = new CalComIntegration(integration);
        const result = await calcom.checkAvailability(date, timezone);

        if (!result.success) {
          console.error('[calendar-check] Cal.com check failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to check availability', slots: [] },
            { status: 200 }
          );
        }

        const slots = formatSlotsTo12h(result.data?.availableSlots || []);
        console.log(`[calendar-check] Returning ${slots.length} available slots from Cal.com`);

        return NextResponse.json({ success: true, slots, date, timezone });
      } catch (error: any) {
        console.error('[calendar-check] Cal.com error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable', slots: [] },
          { status: 200 }
        );
      }
    }

    // Handle Calendly
    if (integration.integration_type === 'calendly') {
      try {
        // Refresh token before use
        const { ensureValidToken } = await import('@/lib/services/oauth-token-refresh.service');
        const validToken = await ensureValidToken(integration.id, 'calendly');
        if (validToken) {
          integration.access_token = validToken;
        }

        const { CalendlyIntegration } = await import('@/lib/integrations/calendly');
        const calendly = new CalendlyIntegration(integration);
        const result = await calendly.checkAvailability(date, timezone);

        if (!result.success) {
          console.error('[calendar-check] Calendly check failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to check availability', slots: [] },
            { status: 200 }
          );
        }

        const slots = formatSlotsTo12h(result.data?.availableSlots || []);
        console.log(`[calendar-check] Returning ${slots.length} available slots from Calendly`);

        return NextResponse.json({ success: true, slots, date, timezone });
      } catch (error: any) {
        console.error('[calendar-check] Calendly error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable', slots: [] },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Unknown calendar type', slots: [] },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[calendar-check] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', slots: [] },
      { status: 500 }
    );
  }
}
