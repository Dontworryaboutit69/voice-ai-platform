import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const {
      agent_id,
      customer_name,
      customer_phone,
      customer_email,
      appointment_date,
      appointment_time,
      duration_minutes = 60,
      notes
    } = await request.json();

    console.log(`[book-appointment] Booking for agent ${agent_id}:`, {
      customer_name,
      customer_phone,
      appointment_date,
      appointment_time
    });

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
        message: 'I'\''ve taken down your information. Our office manager will call you within the hour to confirm your appointment.'
      }, { status: 400 });
    }

    console.log(`[book-appointment] Found ${integration.integration_type} integration`);

    // Route to appropriate calendar provider
    if (integration.integration_type === 'gohighlevel') {
      return await bookGHLAppointment(
        integration,
        customer_name,
        customer_phone,
        customer_email,
        appointment_date,
        appointment_time,
        duration_minutes,
        notes
      );
    } else if (integration.integration_type === 'google_calendar') {
      return await bookGoogleCalendarAppointment(
        integration,
        customer_name,
        customer_phone,
        customer_email,
        appointment_date,
        appointment_time,
        duration_minutes,
        notes
      );
    }

    return NextResponse.json({
      error: 'Unsupported calendar type',
      message: 'I'\''ve taken down your information. Our office will call you back to confirm the appointment.'
    }, { status: 400 });

  } catch (error: any) {
    console.error('[book-appointment] Error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to book appointment',
      message: 'I'\''ve noted your appointment request. Our office manager will call you within the hour to confirm everything.'
    }, { status: 500 });
  }
}

async function bookGHLAppointment(
  integration: any,
  customer_name: string,
  customer_phone: string,
  customer_email: string | undefined,
  appointment_date: string,
  appointment_time: string,
  duration_minutes: number,
  notes: string | undefined
) {
  try {
    const { calendar_id, location_id } = integration.config || {};

    if (!calendar_id || !location_id) {
      console.error('[book-appointment] Missing calendar_id or location_id in config');
      return NextResponse.json({
        error: 'Calendar not configured',
        message: 'I'\''ve taken your information. Our office manager will call you to confirm the appointment.'
      }, { status: 400 });
    }

    // Step 1: Create or find contact in GHL
    console.log('[book-appointment] Step 1: Creating/finding contact in GHL');

    // Search for existing contact by phone
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${location_id}&email=${encodeURIComponent(customer_email || '')}&phone=${encodeURIComponent(customer_phone)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.api_key}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      }
    );

    let contactId: string;

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contact && searchData.contact.id) {
        contactId = searchData.contact.id;
        console.log(`[book-appointment] Found existing contact: ${contactId}`);
      } else {
        // Create new contact
        const createContactResponse = await fetch(
          'https://services.leadconnectorhq.com/contacts/',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${integration.api_key}`,
              'Version': '2021-07-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              locationId: location_id,
              name: customer_name,
              phone: customer_phone,
              email: customer_email || undefined,
              source: 'AI Voice Agent'
            })
          }
        );

        if (!createContactResponse.ok) {
          const errorText = await createContactResponse.text();
          console.error('[book-appointment] Failed to create contact:', createContactResponse.status, errorText);
          throw new Error('Failed to create contact in CRM');
        }

        const contactData = await createContactResponse.json();
        contactId = contactData.contact.id;
        console.log(`[book-appointment] Created new contact: ${contactId}`);
      }
    } else {
      throw new Error('Failed to search for existing contact');
    }

    // Step 2: Book the appointment
    console.log('[book-appointment] Step 2: Booking appointment in GHL calendar');

    // Combine date and time into ISO 8601 format
    const startDateTime = new Date(`${appointment_date}T${appointment_time}:00`).toISOString();

    const appointmentPayload = {
      calendarId: calendar_id,
      locationId: location_id,
      contactId: contactId,
      startTime: startDateTime,
      title: `Appointment with ${customer_name}`,
      appointmentStatus: 'confirmed',
      assignedUserId: undefined, // Will use calendar default
      notes: notes || `Phone: ${customer_phone}${customer_email ? `\nEmail: ${customer_email}` : ''}`
    };

    console.log('[book-appointment] Creating appointment with payload:', JSON.stringify(appointmentPayload, null, 2));

    const appointmentResponse = await fetch(
      'https://services.leadconnectorhq.com/calendars/events/appointments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.api_key}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      }
    );

    if (!appointmentResponse.ok) {
      const errorText = await appointmentResponse.text();
      console.error('[book-appointment] GHL appointment API error:', appointmentResponse.status, errorText);

      return NextResponse.json({
        error: 'Failed to book appointment',
        message: 'I'\''ve saved your contact information in our system. Our office manager will call you within the hour to finalize your appointment.'
      }, { status: appointmentResponse.status });
    }

    const appointmentData = await appointmentResponse.json();
    console.log('[book-appointment] Appointment created successfully:', appointmentData);

    // Format the confirmation message
    const appointmentDateTime = new Date(startDateTime);
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
      appointment_id: appointmentData.id,
      contact_id: contactId,
      message: `Perfect! I'\''ve booked your appointment for ${formattedDate} at ${formattedTime}. You'\''ll receive a confirmation via ${customer_email ? 'email' : 'text'}. Is there anything else I can help you with?`
    });

  } catch (error: any) {
    console.error('[book-appointment] GHL error:', error);
    return NextResponse.json({
      error: error.message,
      message: 'I'\''ve taken down all your information. Our office manager will call you within the hour to confirm your appointment.'
    }, { status: 500 });
  }
}

async function bookGoogleCalendarAppointment(
  integration: any,
  customer_name: string,
  customer_phone: string,
  customer_email: string | undefined,
  appointment_date: string,
  appointment_time: string,
  duration_minutes: number,
  notes: string | undefined
) {
  try {
    // TODO: Implement Google Calendar booking
    // Will need to use Google Calendar API with the stored access/refresh tokens

    console.log('[book-appointment] Google Calendar not yet implemented');

    return NextResponse.json({
      error: 'Google Calendar integration coming soon',
      message: 'I'\''ve taken your information. Our office manager will call you within the hour to confirm your appointment.'
    }, { status: 501 });

  } catch (error: any) {
    console.error('[book-appointment] Google Calendar error:', error);
    return NextResponse.json({
      error: error.message,
      message: 'I'\''ve noted your appointment request. Our office will call you back shortly.'
    }, { status: 500 });
  }
}
