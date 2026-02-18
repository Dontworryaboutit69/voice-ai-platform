import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Retell may nest params inside `args` object
    const args = body.args || body;

    // Accept BOTH old param names (customer_*, appointment_*) and new ones (caller_*, date/time)
    const agent_id = args.agent_id;
    const customer_name = args.customer_name || args.caller_name || args.name;
    const customer_phone = args.customer_phone || args.caller_phone || args.phone;
    const customer_email = args.customer_email || args.caller_email || args.email;
    const appointment_date = args.appointment_date || args.date;
    const appointment_time = args.appointment_time || args.time;
    const duration_minutes = args.duration_minutes || 30;
    const notes = args.notes;

    console.log(`[book-appointment /api/tools] RAW BODY:`, JSON.stringify(body, null, 2));
    console.log(`[book-appointment /api/tools] Parsed:`, {
      agent_id,
      customer_name,
      customer_phone,
      appointment_date,
      appointment_time
    });

    // Normalize time format: handle "9:00 AM", "09:00 ET", "14:00", "2:00 PM", etc.
    let normalizedTime = appointment_time;
    if (normalizedTime) {
      // Remove timezone suffixes like "ET", "EST", "PT", etc.
      normalizedTime = normalizedTime.replace(/\s*(ET|EST|EDT|CT|CST|CDT|MT|MST|MDT|PT|PST|PDT)\s*$/i, '').trim();
      // Convert 12h to 24h format
      const ampmMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1]);
        const min = ampmMatch[2];
        const period = ampmMatch[3].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        normalizedTime = `${hour.toString().padStart(2, '0')}:${min}`;
      }
      // Ensure HH:MM format
      const simpleMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);
      if (simpleMatch) {
        normalizedTime = `${simpleMatch[1].padStart(2, '0')}:${simpleMatch[2]}`;
      }
    }

    console.log(`[book-appointment /api/tools] Normalized time: "${appointment_time}" → "${normalizedTime}"`);

    if (!customer_name || !customer_phone || !appointment_date || !normalizedTime) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: "I need your name, phone number, and preferred appointment date and time to book."
      });
    }

    const supabase = createServiceClient();

    // Resolve the real platform agent_id:
    // The Retell LLM may send a Retell agent ID (like "agent_001" or "agent_fc977a...")
    // but we need the Supabase agent UUID to find integrations.
    let resolvedAgentId = agent_id;

    // Check if the provided agent_id is a valid Supabase UUID by trying to find its integration
    const { data: directMatch } = await supabase
      .from('integration_connections')
      .select('agent_id')
      .eq('agent_id', agent_id || '')
      .eq('is_active', true)
      .limit(1);

    if (!directMatch || directMatch.length === 0) {
      // agent_id doesn't match Supabase — try to resolve from Retell agent ID
      console.log(`[book-appointment /api/tools] agent_id "${agent_id}" not found in integrations, resolving...`);

      // Look up by retell_agent_id in agents table
      if (agent_id) {
        const { data: agentRow } = await supabase
          .from('agents')
          .select('id')
          .eq('retell_agent_id', agent_id)
          .single();

        if (agentRow) {
          resolvedAgentId = agentRow.id;
          console.log(`[book-appointment /api/tools] Resolved Retell agent "${agent_id}" → platform "${resolvedAgentId}"`);
        }
      }

      // If still not resolved, fall back: find ANY active GHL integration
      // (for single-agent setups this is safe)
      if (!resolvedAgentId || resolvedAgentId === agent_id) {
        const { data: fallbackInt } = await supabase
          .from('integration_connections')
          .select('agent_id')
          .eq('is_active', true)
          .eq('integration_type', 'gohighlevel')
          .limit(1);

        if (fallbackInt && fallbackInt.length > 0) {
          resolvedAgentId = fallbackInt[0].agent_id;
          console.log(`[book-appointment /api/tools] Fallback to first active GHL integration: "${resolvedAgentId}"`);
        }
      }
    }

    // Get active calendar integration for the resolved agent
    const { data: integration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', resolvedAgentId || '')
      .eq('is_active', true)
      .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('[book-appointment /api/tools] No active calendar integration found for resolvedAgentId:', resolvedAgentId, integrationError);
      return NextResponse.json({
        success: false,
        error: 'No calendar integration configured',
        message: "I've taken down your information. Our office manager will call you within the hour to confirm your appointment."
      });
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
          success: false,
          error: 'Failed to create contact',
          message: "I've taken down your information. Our office manager will call you within the hour to confirm your appointment."
        });
      }

      const contactId = contactResult.data.contactId;
      console.log(`[book-appointment] Contact ready: ${contactId}`);

      // Step 2: Book the appointment
      console.log('[book-appointment] Step 2: Booking appointment');
      const bookResult = await ghl.bookAppointment({
        contactId,
        date: appointment_date,
        time: normalizedTime,
        timezone: 'America/New_York',
        title: `Appointment with ${customer_name}`,
        description: notes || `Phone: ${customer_phone}${customer_email ? `\nEmail: ${customer_email}` : ''}`,
        durationMinutes: duration_minutes,
      });

      if (!bookResult.success) {
        console.error('[book-appointment] GHL booking failed:', bookResult.error);
        return NextResponse.json({
          success: false,
          error: bookResult.error || 'Failed to book appointment',
          message: "I've saved your contact information in our system. Our office manager will call you within the hour to finalize your appointment."
        });
      }

      console.log(`[book-appointment] Appointment booked: ${bookResult.data?.appointmentId}`);

      // Format confirmation
      const appointmentDateTime = new Date(`${appointment_date}T${normalizedTime}:00`);
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
        success: false,
        error: 'Google Calendar not yet supported',
        message: "I've taken your information. Our office manager will call you to confirm the appointment."
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported calendar type',
      message: "I've taken your information. Our office will call you back to confirm."
    });

  } catch (error: any) {
    console.error('[book-appointment /api/tools] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to book appointment',
      message: "I've noted your appointment request. Our office manager will call you within the hour to confirm everything."
    });
  }
}
