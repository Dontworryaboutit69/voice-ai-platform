import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

/**
 * GET /api/debug/test-ghl-booking?agentId=xxx
 * Test GHL contact creation and appointment booking directly
 */
export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId') || 'f02fd2dc-32d7-42b8-8378-126d354798f7';

    const supabase = createServiceClient();

    // Get GHL integration
    const { data: integration, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .eq('integration_type', 'gohighlevel')
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'No GHL integration found', details: error }, { status: 404 });
    }

    const { GoHighLevelIntegration } = await import('@/lib/integrations/gohighlevel');
    const ghl = new GoHighLevelIntegration(integration);

    const results: any = {
      integration_found: true,
      calendar_id: integration.config?.calendar_id,
      location_id: integration.config?.location_id,
      has_api_key: !!integration.api_key,
    };

    // Step 1: Test contact creation
    console.log('[debug] Testing contact creation...');
    const contactResult = await ghl.getOrCreateContact({
      name: 'Test User',
      phone: '+14079780655',
      email: 'test@example.com',
    });
    results.contact = contactResult;

    // Step 2: If contact created, test appointment booking
    if (contactResult.success && contactResult.data) {
      console.log('[debug] Testing appointment booking...');

      // Use tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const bookResult = await ghl.bookAppointment({
        contactId: contactResult.data.contactId,
        date: dateStr,
        time: '14:00',
        timezone: 'America/New_York',
        title: 'Test Appointment',
        description: 'Debug test booking',
        durationMinutes: 30,
      });
      results.booking = bookResult;
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  }
}
