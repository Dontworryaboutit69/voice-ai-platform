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
      const calendarId = integration.config?.calendar_id;
      const locationId = integration.config?.location_id;
      const accessToken = integration.access_token;

      if (!calendarId || !locationId || !accessToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Calendar not properly configured',
            slots: []
          },
          { status: 200 }
        );
      }

      try {
        // Fetch available slots from GoHighLevel
        const response = await fetch(
          `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${date}&endDate=${date}&timezone=${encodeURIComponent(timezone)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error('[calendar-check] GHL API error:', response.status);
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to fetch calendar availability',
              slots: []
            },
            { status: 200 }
          );
        }

        const data = await response.json();
        const slots = data.slots || [];

        console.log(`[calendar-check] Found ${slots.length} available slots`);

        return NextResponse.json({
          success: true,
          slots: slots,
          date: date,
          timezone: timezone
        });

      } catch (error: any) {
        console.error('[calendar-check] Error fetching GHL slots:', error);
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
