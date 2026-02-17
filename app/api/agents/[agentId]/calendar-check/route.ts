import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { date, timezone = 'America/New_York' } = body;

    console.log(`[calendar-check] Checking availability for agent ${agentId}, date: ${date}`);

    const supabase = createServiceClient();

    // Get active calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('[calendar-check] No active calendar integration:', integrationError);
      return NextResponse.json(
        {
          success: false,
          error: 'No calendar integration configured',
          slots: []
        },
        { status: 200 }
      );
    }

    console.log(`[calendar-check] Found ${integration.integration_type} integration`);

    // Handle GoHighLevel calendar
    if (integration.integration_type === 'gohighlevel') {
      try {
        console.log('[calendar-check] Fetching real availability from GHL for date:', date);

        const { GoHighLevelIntegration } = await import('@/lib/integrations/gohighlevel');
        const ghl = new GoHighLevelIntegration(integration);

        const result = await ghl.checkAvailability(date, timezone);

        if (!result.success) {
          console.error('[calendar-check] GHL availability check failed:', result.error);
          return NextResponse.json(
            {
              success: false,
              error: result.error || 'Failed to check availability',
              slots: []
            },
            { status: 200 }
          );
        }

        // Convert 24h format slots (HH:MM) to 12h format for the voice agent
        const slots = (result.data?.availableSlots || []).map(slot => {
          const [hour, minute] = slot.split(':').map(Number);
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
        });

        console.log(`[calendar-check] Returning ${slots.length} available slots from GHL`);

        return NextResponse.json({
          success: true,
          slots: slots,
          date: date,
          timezone: timezone
        });

      } catch (error: any) {
        console.error('[calendar-check] Error:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Calendar service unavailable',
            slots: []
          },
          { status: 200 }
        );
      }
    }

    // Handle Google Calendar
    if (integration.integration_type === 'google_calendar') {
      // TODO: Implement Google Calendar logic
      return NextResponse.json(
        {
          success: false,
          error: 'Google Calendar not yet implemented',
          slots: []
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unknown calendar type',
        slots: []
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[calendar-check] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        slots: []
      },
      { status: 500 }
    );
  }
}
