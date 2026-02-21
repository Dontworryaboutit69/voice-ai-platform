import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// Calendar integration types that support booking
const CALENDAR_TYPES = ['gohighlevel', 'google_calendar', 'cal_com', 'calendly'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    // Log the FULL raw body from Retell so we can debug
    console.log(`[book-appointment] RAW BODY from Retell:`, JSON.stringify(body, null, 2));

    // Retell may nest params inside `args` object
    const args = body.args || body;

    // Accept both naming conventions (Retell tool sends customer_*, our API uses caller_*)
    const providedContactId = args.contactId;
    const rawDate = args.date || args.appointment_date;
    const rawTime = args.time || args.appointment_time;
    const timezone = args.timezone || 'America/New_York';
    const title = args.title;
    const notes = args.notes;
    const caller_name = args.caller_name || args.customer_name;
    const caller_phone = args.caller_phone || args.customer_phone;
    const caller_email = args.caller_email || args.customer_email;

    // Normalize time format: handle "9:00 AM", "09:00 ET", "14:00", "2:00 PM", etc.
    let time = rawTime;
    if (time) {
      // Remove timezone suffixes like "ET", "EST", "PT", etc.
      time = time.replace(/\s*(ET|EST|EDT|CT|CST|CDT|MT|MST|MDT|PT|PST|PDT)\s*$/i, '').trim();

      // Convert 12h to 24h format
      const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1]);
        const min = ampmMatch[2];
        const period = ampmMatch[3].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        time = `${hour.toString().padStart(2, '0')}:${min}`;
      }

      // Ensure HH:MM format (pad single digit hours)
      const simpleMatch = time.match(/^(\d{1,2}):(\d{2})$/);
      if (simpleMatch) {
        time = `${simpleMatch[1].padStart(2, '0')}:${simpleMatch[2]}`;
      }
    }
    const date = rawDate;

    console.log(`[book-appointment] Parsed params:`, { providedContactId, date, time, rawTime, timezone, caller_name, caller_phone, caller_email });

    if (!date || !time) {
      return NextResponse.json(
        { success: false, error: 'date and time are required' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const requestedDate = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (requestedDate < now) {
      console.log(`[book-appointment] Rejecting past date/time: ${date} ${time}`);
      return NextResponse.json(
        { success: false, error: `Cannot book in the past. ${date} ${time} has already passed.` },
        { status: 200 }
      );
    }

    const supabase = createServiceClient();

    // Get active calendar integration
    const { data: integrations, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .in('integration_type', CALENDAR_TYPES);

    if (integrationError || !integrations || integrations.length === 0) {
      console.error('[book-appointment] No active calendar integration:', integrationError);
      return NextResponse.json(
        { success: false, error: 'No calendar integration configured' },
        { status: 200 }
      );
    }

    const integration = integrations[0];
    console.log(`[book-appointment] Found ${integration.integration_type} integration`);

    // ==================== GoHighLevel ====================
    if (integration.integration_type === 'gohighlevel') {
      const calendarId = integration.config?.calendar_id;
      const accessToken = integration.api_key;

      if (!calendarId || !accessToken) {
        return NextResponse.json(
          { success: false, error: 'Calendar not properly configured' },
          { status: 200 }
        );
      }

      try {
        const { GoHighLevelIntegration } = await import('@/lib/integrations/gohighlevel');
        const ghl = new GoHighLevelIntegration(integration);

        // If no contactId provided, create or find the contact first
        let contactId = providedContactId;
        if (!contactId) {
          if (!caller_name && !caller_phone && !caller_email) {
            return NextResponse.json(
              { success: false, error: 'Either contactId or caller info (caller_name, caller_phone) is required' },
              { status: 200 }
            );
          }

          console.log(`[book-appointment] No contactId — creating/finding contact in GHL`);
          const contactResult = await ghl.getOrCreateContact({
            name: caller_name,
            phone: caller_phone,
            email: caller_email,
          });

          if (!contactResult.success || !contactResult.data) {
            console.error('[book-appointment] Failed to create/find contact:', contactResult.error);
            return NextResponse.json(
              { success: false, error: contactResult.error || 'Failed to create contact in CRM' },
              { status: 200 }
            );
          }

          contactId = contactResult.data.contactId;
          console.log(`[book-appointment] Contact ready: ${contactId}`);
        }

        const result = await ghl.bookAppointment({
          contactId,
          date,
          time,
          timezone,
          title: title || 'Phone Consultation',
          description: notes || 'Booked via phone call',
          durationMinutes: 30
        });

        if (!result.success) {
          console.error('[book-appointment] GHL booking failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to book appointment' },
            { status: 200 }
          );
        }

        console.log(`[book-appointment] Appointment booked: ${result.data?.appointmentId}`);

        return NextResponse.json({
          success: true,
          appointmentId: result.data?.appointmentId,
          contactId,
          date,
          time,
          timezone
        });
      } catch (error: any) {
        console.error('[book-appointment] GHL error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable' },
          { status: 200 }
        );
      }
    }

    // ==================== Google Calendar ====================
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

        const result = await gcal.bookAppointment({
          contactId: caller_email ? `gcal_${caller_email}` : undefined,
          date,
          time,
          timezone,
          title: title || `Appointment with ${caller_name || 'Caller'}`,
          description: notes || 'Booked via phone call',
          durationMinutes: 30
        });

        if (!result.success) {
          console.error('[book-appointment] Google Calendar booking failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to book appointment' },
            { status: 200 }
          );
        }

        console.log(`[book-appointment] Google Calendar event created: ${result.data?.appointmentId}`);

        return NextResponse.json({
          success: true,
          appointmentId: result.data?.appointmentId,
          date,
          time,
          timezone
        });
      } catch (error: any) {
        console.error('[book-appointment] Google Calendar error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable' },
          { status: 200 }
        );
      }
    }

    // ==================== Cal.com ====================
    if (integration.integration_type === 'cal_com') {
      try {
        const { CalComIntegration } = await import('@/lib/integrations/cal-com');
        const calcom = new CalComIntegration(integration);

        const email = caller_email || `${(caller_name || 'caller').replace(/\s+/g, '.').toLowerCase()}@placeholder.com`;

        const result = await calcom.bookAppointment({
          contactId: `calcom_${email}`,
          date,
          time,
          timezone,
          title: title || `Appointment with ${caller_name || 'Caller'}`,
          description: notes || 'Booked via phone call',
          durationMinutes: 30
        });

        if (!result.success) {
          console.error('[book-appointment] Cal.com booking failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to book appointment' },
            { status: 200 }
          );
        }

        console.log(`[book-appointment] Cal.com booking created: ${result.data?.appointmentId}`);

        return NextResponse.json({
          success: true,
          appointmentId: result.data?.appointmentId,
          date,
          time,
          timezone
        });
      } catch (error: any) {
        console.error('[book-appointment] Cal.com error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable' },
          { status: 200 }
        );
      }
    }

    // ==================== Calendly ====================
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

        const email = caller_email || `${(caller_name || 'caller').replace(/\s+/g, '.').toLowerCase()}@placeholder.com`;

        const result = await calendly.bookAppointment({
          contactId: `calendly_${email}`,
          date,
          time,
          timezone,
          title: title || `Appointment with ${caller_name || 'Caller'}`,
          description: notes || 'Booked via phone call',
          durationMinutes: 30
        });

        if (!result.success) {
          console.error('[book-appointment] Calendly booking failed:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to book appointment' },
            { status: 200 }
          );
        }

        console.log(`[book-appointment] Calendly booking created: ${result.data?.appointmentId}`);

        return NextResponse.json({
          success: true,
          appointmentId: result.data?.appointmentId,
          date,
          time,
          timezone
        });
      } catch (error: any) {
        console.error('[book-appointment] Calendly error:', error);
        return NextResponse.json(
          { success: false, error: 'Calendar service unavailable' },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Unknown calendar type' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[book-appointment] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
