import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

export async function POST(request: NextRequest) {
  try {
    const {
      agent_id,
      customer_name,
      customer_phone,
      customer_email,
      appointment_date,
      appointment_time,
      duration_minutes = 30,
      notes
    } = await request.json();

    console.log(`[book-appointment] Booking for agent ${agent_id}:`, {
      customer_name,
      customer_phone,
      appointment_date,
      appointment_time
    });

    if (!agent_id || !customer_name || !customer_phone || !appointment_date || !appointment_time) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: "I need your name, phone number, and preferred appointment date and time to book."
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get active calendar integration for this agent
    const { data: integration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agent_id)
      .eq('is_active', true)
      .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('[book-appointment] No active calendar integration found:', integrationError);
      return NextResponse.json({
        error: 'No calendar integration configured',
        message: "I've taken down your information. Our office manager will call you within the hour to confirm your appointment."
      }, { status: 400 });
    }

    console.log(`[book-appointment] Found ${integration.integration_type} integration`);

    if (integration.integration_type === 'gohighlevel') {
      const ghl = new GoHighLevelIntegration(integration);

      // Step 1: Find or create contact
      console.log('[book-appointment] Step 1: Creating/finding contact in GHL');
      const contactResult = await ghl.getOrCreateContact({
        name: customer_name,
        phone: customer_phone,
        email: customer_email,
      });

      if (!contactResult.success || !contactResult.data) {
        console.error('[book-appointment] Failed to create/find contact:', contactResult.error);
        return NextResponse.json({
          error: 'Failed to create contact',
          message: "I've taken down your information. Our office manager will call you within the hour to confirm your appointment."
        }, { status: 500 });
      }

      const contactId = contactResult.data.contactId;
      console.log(`[book-appointment] Contact ready: ${contactId}`);

      // Step 2: Book the appointment
      console.log('[book-appointment] Step 2: Booking appointment');
      const bookResult = await ghl.bookAppointment({
        contactId,
        date: appointment_date,
        time: appointment_time,
        timezone: 'America/New_York',
        title: `Appointment with ${customer_name}`,
        description: notes || `Phone: ${customer_phone}${customer_email ? `\nEmail: ${customer_email}` : ''}`,
        durationMinutes: duration_minutes,
      });

      if (!bookResult.success) {
        console.error('[book-appointment] GHL booking failed:', bookResult.error);
        return NextResponse.json({
          error: bookResult.error || 'Failed to book appointment',
          message: "I've saved your contact information in our system. Our office manager will call you within the hour to finalize your appointment."
        }, { status: 500 });
      }

      console.log(`[book-appointment] Appointment booked: ${bookResult.data?.appointmentId}`);

      // Format confirmation
      const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}:00`);
      const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      return NextResponse.json({
        success: true,
        appointment_id: bookResult.data?.appointmentId,
        contact_id: contactId,
        message: `Your appointment is confirmed for ${formattedDate} at ${formattedTime}. You'll receive a confirmation shortly. Is there anything else I can help you with?`
      });
    }

    if (integration.integration_type === 'google_calendar') {
      return NextResponse.json({
        error: 'Google Calendar not yet supported',
        message: "I've taken your information. Our office manager will call you to confirm the appointment."
      }, { status: 501 });
    }

    return NextResponse.json({
      error: 'Unsupported calendar type',
      message: "I've taken your information. Our office will call you back to confirm."
    }, { status: 400 });

  } catch (error: any) {
    console.error('[book-appointment] Error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to book appointment',
      message: "I've noted your appointment request. Our office manager will call you within the hour to confirm everything."
    }, { status: 500 });
  }
}
