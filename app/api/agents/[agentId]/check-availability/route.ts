import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/[agentId]/check-availability
 * Check calendar availability for a given date
 *
 * This endpoint is called by the AI during conversations to check available appointment slots
 * before booking appointments with customers.
 *
 * Body:
 * {
 *   "date": "2024-03-20",
 *   "timezone": "America/New_York"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { date, timezone } = await request.json();

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get agent and check for active integration
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        id,
        name,
        integration_connections!inner (
          id,
          integration_type,
          credentials,
          config,
          is_active
        )
      `)
      .eq('id', agentId)
      .eq('integration_connections.is_active', true)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Find calendar integration (GoHighLevel, Google Calendar, or Calendly)
    const calendarConnection = (agent.integration_connections as any[]).find(
      (conn: any) => ['gohighlevel', 'google-calendar', 'calendly'].includes(conn.integration_type)
    );

    if (!calendarConnection) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active calendar integration found',
          message: 'Please connect a calendar integration (GoHighLevel, Google Calendar, or Calendly) to check availability'
        },
        { status: 400 }
      );
    }

    // Check if calendar is configured
    if (calendarConnection.integration_type === 'gohighlevel' && !calendarConnection.config?.calendar_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Calendar not configured',
          message: 'Please select a calendar in your GoHighLevel integration settings'
        },
        { status: 400 }
      );
    }

    // Check availability based on integration type
    let availableSlots: string[] = [];

    if (calendarConnection.integration_type === 'gohighlevel') {
      const ghl = new GoHighLevelIntegration({
        ...calendarConnection.credentials,
        config: calendarConnection.config
      });

      const result = await ghl.checkAvailability(date, timezone || 'America/New_York');

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to check availability' },
          { status: 400 }
        );
      }

      availableSlots = result.data?.availableSlots || [];
    } else {
      // For other calendar types, return a message
      return NextResponse.json(
        {
          success: false,
          error: 'Availability checking not yet implemented for this calendar type',
          message: `Availability checking for ${calendarConnection.integration_type} is coming soon`
        },
        { status: 501 }
      );
    }

    // Format response for AI
    return NextResponse.json({
      success: true,
      date,
      timezone: timezone || 'America/New_York',
      available_slots: availableSlots,
      total_slots: availableSlots.length,
      message: availableSlots.length > 0
        ? `Found ${availableSlots.length} available time slots on ${date}`
        : `No available time slots on ${date}. Please try a different date.`
    });

  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
