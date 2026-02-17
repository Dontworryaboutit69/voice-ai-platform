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
        console.log('[calendar-check] Generating available slots for date:', date);

        // TODO: Integrate with actual GoHighLevel calendar API
        // For now, return standard business hours (9 AM - 5 PM, hourly slots)
        const slots = [
          '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
        ];

        console.log(`[calendar-check] Returning ${slots.length} available slots`);

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
