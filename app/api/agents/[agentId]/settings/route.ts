import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { getAppUrl, getTransferCallToolConfig } from '@/lib/retell-tools';
import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const {
      business_name,
      voice_id,
      status,
      email_notifications_enabled,
      email_message_taken,
      email_appointment_booked,
      email_daily_summary,
      // Transfer settings
      transfer_enabled,
      transfer_number,
      transfer_person_name,
      transfer_triggers,
    } = body;

    const supabase = createServiceClient();

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (business_name !== undefined) updateData.business_name = business_name;
    if (voice_id !== undefined) updateData.voice_id = voice_id;
    if (status !== undefined) updateData.status = status;
    if (email_notifications_enabled !== undefined) updateData.email_notifications_enabled = email_notifications_enabled;
    if (email_message_taken !== undefined) updateData.email_message_taken = email_message_taken;
    if (email_appointment_booked !== undefined) updateData.email_appointment_booked = email_appointment_booked;
    if (email_daily_summary !== undefined) updateData.email_daily_summary = email_daily_summary;

    // Transfer settings
    if (transfer_enabled !== undefined) updateData.transfer_enabled = transfer_enabled;
    if (transfer_number !== undefined) updateData.transfer_number = transfer_number;
    if (transfer_person_name !== undefined) updateData.transfer_person_name = transfer_person_name;
    if (transfer_triggers !== undefined) updateData.transfer_triggers = transfer_triggers;

    // Update agent settings
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Determine if transfer settings changed
    const transferChanged = transfer_enabled !== undefined ||
      transfer_number !== undefined ||
      transfer_person_name !== undefined;

    // Update Retell agent + LLM if connected
    if (data.retell_agent_id && RETELL_API_KEY) {
      try {
        const appUrl = getAppUrl();

        // Update agent-level settings (name, voice, webhook)
        await fetch(`https://api.retellai.com/update-agent`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${RETELL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: data.retell_agent_id,
            agent_name: data.business_name,
            voice_id: data.voice_id,
            webhook_url: `${appUrl}/api/webhooks/retell/call-events`
          })
        });

        // If transfer settings changed, update the LLM's general_tools
        if (transferChanged && data.retell_llm_id) {
          console.log('[settings] Transfer settings changed — syncing to Retell LLM...');
          const retell = new Retell({ apiKey: RETELL_API_KEY });

          // Build the new tools array
          const tools: any[] = [
            {
              type: 'end_call',
              name: 'end_call',
              description: 'End the call when the conversation is complete, customer says goodbye, or all tasks are done.',
            },
          ];

          // Add transfer tool if enabled
          if (data.transfer_enabled && data.transfer_number) {
            tools.push(getTransferCallToolConfig(data.transfer_number, data.transfer_person_name));
            console.log(`[settings] ✅ Adding transfer_call tool → ${data.transfer_number}`);
          } else {
            console.log('[settings] Transfer disabled — removing transfer_call tool from LLM');
          }

          // Check for GHL integration to add calendar tools
          const { data: ghlIntegration } = await supabase
            .from('integration_connections')
            .select('*')
            .eq('agent_id', agentId)
            .eq('integration_type', 'gohighlevel')
            .eq('is_active', true)
            .single();

          if (ghlIntegration && ghlIntegration.config?.calendar_id) {
            tools.push({
              type: 'custom',
              name: 'check_calendar_availability',
              description: 'Check available appointment time slots for a specific date.',
              url: `${appUrl}/api/agents/${agentId}/calendar-check`,
              speak_on_send: false,
              speak_during_execution: true,
              execution_message_description: 'Checking available times',
              parameters: {
                type: 'object',
                properties: {
                  date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                  timezone: { type: 'string', description: 'Timezone (default: America/New_York)' }
                },
                required: ['date']
              }
            });
            tools.push({
              type: 'custom',
              name: 'book_appointment',
              description: 'Book an appointment for the caller.',
              url: `${appUrl}/api/agents/${agentId}/book-appointment`,
              speak_on_send: false,
              speak_during_execution: true,
              execution_message_description: 'Booking your appointment',
              parameters: {
                type: 'object',
                properties: {
                  caller_name: { type: 'string', description: 'Full name of the caller' },
                  caller_phone: { type: 'string', description: 'Phone number' },
                  date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                  time: { type: 'string', description: 'Time in HH:MM 24h format' }
                },
                required: ['caller_name', 'caller_phone', 'date', 'time']
              }
            });
          }

          try {
            await retell.llm.update(data.retell_llm_id, {
              general_tools: tools
            });
            console.log(`[settings] ✅ Updated LLM ${data.retell_llm_id} with ${tools.length} tools`);
          } catch (llmError) {
            console.error('[settings] Failed to update LLM tools:', llmError);
          }
        }
      } catch (retellError) {
        console.error('Error updating Retell agent:', retellError);
        // Don't fail the whole request if Retell update fails
      }
    }

    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error: any) {
    console.error('Error in settings API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
