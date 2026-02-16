import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { voiceId, modelId } = await request.json();
    const { agentId } = await params;

    console.log(`[test/voice] Received request - voiceId: ${voiceId}, modelId: ${modelId}, agentId: ${agentId}`);

    // Get agent and current prompt from database
    const supabase = createServiceClient();
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        prompt_versions!current_prompt_id (*)
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const promptVersion = agent.prompt_versions;
    if (!promptVersion) {
      return NextResponse.json(
        { success: false, error: 'No prompt version found' },
        { status: 404 }
      );
    }

    // Initialize Retell client
    const retell = new Retell({
      apiKey: RETELL_API_KEY,
    });

    // Create or update Retell agent with current prompt
    let retellAgentId = agent.retell_agent_id;

    // Use selected model or default to gpt-5.2
    const selectedModel = modelId || 'gpt-5.2';

    // Strip SSML tags as they don't work well with most models
    const promptToUse = promptVersion.compiled_prompt.replace(/<[^>]*>/g, '');

    // Configure tools for specific agent types
    const tools: any[] = [];

    // Add RentCast property valuation tool for real estate agents
    if (agent.business_type === 'real-estate' || agent.business_name?.toLowerCase().includes('homevanna')) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      tools.push({
        type: 'custom',
        name: 'get_property_valuation',
        description: 'Get real-time property valuation using RentCast AVM API. Use this when the user provides a complete property address with street, city, state, and zip code.',
        url: `${appUrl}/api/tools/property-valuation`,
        speak_on_send: true,
        speak_during_execution: false,
        execution_message_description: 'Looking up property valuation',
        parameters: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Complete property address including street, city, state, and zip code. Format: "123 Main St, Austin, TX, 78701"'
            }
          },
          required: ['address']
        }
      });
    }

    // Check for active GoHighLevel integration and add calendar booking tool
    const { data: ghlIntegration } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .eq('integration_type', 'gohighlevel')
      .eq('is_active', true)
      .single();

    if (ghlIntegration && ghlIntegration.config?.calendar_id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      // Add calendar availability checking tool
      tools.push({
        type: 'custom',
        name: 'check_calendar_availability',
        description: 'Check available appointment time slots for a specific date. Use this BEFORE booking an appointment to see what times are available.',
        url: `${appUrl}/api/agents/${agentId}/check-availability`,
        speak_on_send: false,
        speak_during_execution: true,
        execution_message_description: 'Checking available times',
        parameters: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date to check availability for in YYYY-MM-DD format (e.g., 2026-02-20)'
            },
            timezone: {
              type: 'string',
              description: 'Timezone (default: America/New_York)',
              default: 'America/New_York'
            }
          },
          required: ['date']
        }
      });

      // Add appointment booking tool
      tools.push({
        type: 'custom',
        name: 'book_appointment',
        description: 'Book an appointment in the calendar. Use this when the customer wants to schedule an appointment and you have collected their name, phone number, preferred date, and time.',
        url: `${appUrl}/api/tools/book-appointment`,
        speak_on_send: false,
        speak_during_execution: true,
        execution_message_description: 'Booking your appointment',
        parameters: {
          type: 'object',
          properties: {
            agent_id: {
              type: 'string',
              description: 'The agent ID (automatically provided)',
              default: agentId
            },
            customer_name: {
              type: 'string',
              description: 'Full name of the customer'
            },
            customer_phone: {
              type: 'string',
              description: 'Phone number of the customer'
            },
            customer_email: {
              type: 'string',
              description: 'Email address of the customer (optional)'
            },
            appointment_date: {
              type: 'string',
              description: 'Date of appointment in YYYY-MM-DD format (e.g., 2026-02-20)'
            },
            appointment_time: {
              type: 'string',
              description: 'Time of appointment in HH:MM format using 24-hour time (e.g., 14:30 for 2:30 PM)'
            },
            duration_minutes: {
              type: 'number',
              description: 'Duration of appointment in minutes (default: 60)',
              default: 60
            },
            notes: {
              type: 'string',
              description: 'Any additional notes or details about the appointment'
            }
          },
          required: ['agent_id', 'customer_name', 'customer_phone', 'appointment_date', 'appointment_time']
        }
      });

      console.log('[test/voice] Added GoHighLevel calendar tools (availability check + booking)');
    }

    // First, create an LLM if needed
    let llmId = agent.retell_llm_id;
    if (!llmId) {
      const llm = await retell.llm.create({
        general_prompt: promptToUse,
        model: selectedModel,
        general_tools: tools
      });
      llmId = llm.llm_id;

      // Save LLM ID to database
      await supabase
        .from('agents')
        .update({ retell_llm_id: llmId })
        .eq('id', agentId);
    } else {
      // Update the LLM with the latest prompt, model, and tools
      try {
        await retell.llm.update(llmId, {
          general_prompt: promptToUse,
          model: selectedModel,
          general_tools: tools
        });
      } catch (error) {
        console.error('Failed to update LLM:', error);
      }
    }

    // Configure webhook URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const agentConfig: any = {
      agent_name: agent.business_name,
      voice_id: voiceId || '11labs-Cimo',
      language: 'en-US',
      webhook_url: `${appUrl}/api/webhooks/retell/call-events`,
      response_engine: {
        type: 'retell-llm',
        llm_id: llmId
      }
    };

    console.log(`[test/voice] Updating Retell agent ${retellAgentId} with voice: ${agentConfig.voice_id}`);

    if (retellAgentId) {
      // Update existing agent
      try {
        const updateResult = await retell.agent.update(retellAgentId, agentConfig);
        console.log(`[test/voice] ✅ Retell agent updated successfully`);
      } catch (updateError) {
        console.error('[test/voice] ❌ Failed to update Retell agent:', updateError);
        // Create new one if update fails
        const newAgent = await retell.agent.create(agentConfig);
        retellAgentId = newAgent.agent_id;

        // Update database with new agent ID
        await supabase
          .from('agents')
          .update({ retell_agent_id: retellAgentId })
          .eq('id', agentId);
      }
    } else {
      // Create new Retell agent
      const newAgent = await retell.agent.create(agentConfig);
      retellAgentId = newAgent.agent_id;

      // Save agent ID to database
      await supabase
        .from('agents')
        .update({ retell_agent_id: retellAgentId })
        .eq('id', agentId);
    }

    // Verify the update worked
    try {
      const verifiedAgent = await retell.agent.retrieve(retellAgentId);
      console.log(`[test/voice] 🔍 Verified Retell agent voice is now: ${verifiedAgent.voice_id}`);
      if (verifiedAgent.voice_id !== agentConfig.voice_id) {
        console.error(`[test/voice] ⚠️ WARNING: Voice mismatch! Expected ${agentConfig.voice_id}, got ${verifiedAgent.voice_id}`);
      }
    } catch (verifyError) {
      console.error('[test/voice] Failed to verify agent update:', verifyError);
    }

    // Get current user for metadata
    const { data: { user } } = await supabase.auth.getUser();

    // Create web call session
    const webCall = await retell.call.createWebCall({
      agent_id: retellAgentId,
      metadata: {
        agent_id: agentId,
        user_id: user?.id || 'unknown',
        test_mode: 'true',
        prompt_version: promptVersion.version_number.toString()
      }
    });

    return NextResponse.json({
      success: true,
      accessToken: webCall.access_token,
      callId: webCall.call_id,
      agentId: retellAgentId
    });

  } catch (error: any) {
    console.error('Error creating voice test session:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create voice test session', details: error.toString() },
      { status: 500 }
    );
  }
}
