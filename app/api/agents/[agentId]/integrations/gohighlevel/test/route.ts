import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

/**
 * Test GoHighLevel integration connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { integration_id } = await request.json();

    console.log('[GHL Test] Testing integration:', integration_id);

    // Get integration from database
    const supabase = createServiceClient();
    const { data: integration, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('id', integration_id)
      .eq('agent_id', agentId)
      .single();

    if (error || !integration) {
      return NextResponse.json({
        success: false,
        error: 'Integration not found'
      }, { status: 404 });
    }

    // Initialize GoHighLevel integration
    const ghl = new GoHighLevelIntegration({
      api_key: integration.api_key,
      config: integration.config
    });

    // Test 1: Validate connection
    console.log('[GHL Test] Validating connection...');
    const validationResult = await ghl.validateConnection();
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: `Connection failed: ${validationResult.error}`
      }, { status: 400 });
    }

    // Test 2: Try to fetch calendars
    console.log('[GHL Test] Fetching calendars...');
    const calendarsResult = await ghl.getCalendars();
    if (!calendarsResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch calendars: ${calendarsResult.error}`
      }, { status: 400 });
    }

    // Test 3: If calendar_id is configured, verify it exists
    const calendarId = integration.config?.calendar_id;
    if (calendarId) {
      const calendars = calendarsResult.data || [];
      const foundCalendar = calendars.find((cal: any) => cal.id === calendarId);

      if (!foundCalendar) {
        return NextResponse.json({
          success: false,
          error: `Configured calendar (${calendarId}) not found in available calendars`
        }, { status: 400 });
      }

      console.log('[GHL Test] ✅ Verified calendar exists:', foundCalendar.name);
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: 'All connection tests passed',
      details: {
        connection: 'OK',
        calendars_found: calendarsResult.data?.length || 0,
        calendar_configured: !!calendarId
      }
    });

  } catch (error: any) {
    console.error('[GHL Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Test failed'
    }, { status: 500 });
  }
}
