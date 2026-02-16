import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

/**
 * Retell function endpoint for booking appointments via GoHighLevel
 * Called by the AI agent during phone calls
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[book-appointment] Received request:', body);

    // Extract parameters from Retell function call
    const {
      agent_id,
      customer_name,
      customer_email,
      customer_phone,
      appointment_date, // Format: YYYY-MM-DD
      appointment_time, // Format: HH:MM
      duration_minutes = 60,
      notes = ''
    } = body;

    if (!agent_id) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required'
      }, { status: 400 });
    }

    if (!customer_name || !customer_phone || !appointment_date || !appointment_time) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customer_name, customer_phone, appointment_date, or appointment_time'
      }, { status: 400 });
    }

    // Get GoHighLevel integration for this agent
    const supabase = createServiceClient();
    const { data: integration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agent_id)
      .eq('integration_type', 'gohighlevel')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('[book-appointment] No active GoHighLevel integration found:', integrationError);
      return NextResponse.json({
        success: false,
        error: 'No calendar integration configured'
      }, { status: 400 });
    }

    // Initialize GoHighLevel integration
    const ghl = new GoHighLevelIntegration({
      api_key: integration.api_key,
      config: integration.config
    });

    // Step 1: Create or find contact
    console.log('[book-appointment] Creating/finding contact...');
    const contactResult = await ghl.createContact({
      firstName: customer_name.split(' ')[0],
      lastName: customer_name.split(' ').slice(1).join(' ') || '',
      email: customer_email || '',
      phone: customer_phone,
      source: 'phone_call'
    });

    if (!contactResult.success) {
      console.error('[book-appointment] Failed to create contact:', contactResult.error);
      return NextResponse.json({
        success: false,
        error: `Failed to create contact: ${contactResult.error}`
      }, { status: 500 });
    }

    const contactId = contactResult.data.contactId;
    console.log('[book-appointment] Contact created/found:', contactId);

    // Step 2: Book appointment
    console.log('[book-appointment] Booking appointment...');
    const appointmentResult = await ghl.bookAppointment({
      contactId,
      title: `Appointment with ${customer_name}`,
      date: appointment_date,
      time: appointment_time,
      timezone: 'America/New_York', // Default timezone, ideally should be configurable
      durationMinutes: duration_minutes,
      description: notes
    });

    if (!appointmentResult.success) {
      console.error('[book-appointment] Failed to book appointment:', appointmentResult.error);
      return NextResponse.json({
        success: false,
        error: `Failed to book appointment: ${appointmentResult.error}`
      }, { status: 500 });
    }

    const appointmentId = appointmentResult.data.appointmentId;
    console.log('[book-appointment] Appointment booked:', appointmentId);

    // Success response
    return NextResponse.json({
      success: true,
      message: `Appointment booked successfully for ${customer_name} on ${appointment_date} at ${appointment_time}`,
      data: {
        contact_id: contactId,
        appointment_id: appointmentId
      }
    });

  } catch (error: any) {
    console.error('[book-appointment] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to book appointment'
    }, { status: 500 });
  }
}
