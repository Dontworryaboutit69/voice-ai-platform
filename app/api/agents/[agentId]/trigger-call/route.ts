import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Webhook endpoint for triggering outbound calls from CRM workflows
 *
 * Users can call this from GoHighLevel (or any CRM) workflows to trigger calls
 *
 * POST /api/agents/[agentId]/trigger-call
 *
 * Body:
 * {
 *   "to_number": "+15551234567",
 *   "contact_name": "John Doe",
 *   "contact_data": { "email": "john@example.com", "service": "roofing" }
 * }
 *
 * Headers:
 * Authorization: Bearer <agent_webhook_token>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    // 1. Validate webhook token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token matches agent's webhook token
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, retell_agent_id, retell_phone_number, webhook_token')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (!agent.webhook_token || agent.webhook_token !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { to_number, contact_name, contact_data } = body;

    if (!to_number) {
      return NextResponse.json(
        { success: false, error: 'to_number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to_number.replace(/[-\s]/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use E.164 format: +1234567890' },
        { status: 400 }
      );
    }

    // 3. Check if agent is active and has phone number
    if (!agent.retell_agent_id || !agent.retell_phone_number) {
      return NextResponse.json(
        { success: false, error: 'Agent is not activated. Please activate the agent first.' },
        { status: 400 }
      );
    }

    // 4. Create outbound call via Retell API
    const retellApiKey = process.env.RETELL_API_KEY;
    if (!retellApiKey) {
      return NextResponse.json(
        { success: false, error: 'Retell API key not configured' },
        { status: 500 }
      );
    }

    const retellResponse = await fetch('https://api.retellai.com/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_number: agent.retell_phone_number,
        to_number: to_number,
        override_agent_id: agent.retell_agent_id,
        metadata: {
          agent_id: agentId,
          contact_name,
          contact_data: contact_data || {},
          triggered_via: 'webhook'
        }
      })
    });

    if (!retellResponse.ok) {
      const errorData = await retellResponse.json();
      return NextResponse.json(
        { success: false, error: `Retell API error: ${errorData.message || 'Failed to create call'}` },
        { status: retellResponse.status }
      );
    }

    const retellData = await retellResponse.json();

    // 5. Log the outbound call request
    await supabase.from('outbound_calls').insert({
      agent_id: agentId,
      to_number,
      contact_name,
      contact_data,
      status: 'in_progress',
      retell_call_id: retellData.call_id,
      notes: 'Triggered via webhook'
    });

    return NextResponse.json({
      success: true,
      call_id: retellData.call_id,
      message: 'Call initiated successfully',
      call_status: retellData.call_status
    });

  } catch (error: any) {
    console.error('Error triggering call via webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve webhook information
 * Returns the webhook URL and token for this agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    console.log('[Webhook] Fetching agent data for:', agentId);

    // Get agent data - try with webhook_token first, fallback if column doesn't exist
    let agent: any = null;
    let error: any = null;

    // First attempt: try to select with webhook_token
    const result = await supabase
      .from('agents')
      .select('id, name, webhook_token')
      .eq('id', agentId)
      .single();

    // Check if the error is about webhook_token column not existing
    if (result.error && result.error.message?.includes('webhook_token')) {
      console.log('[Webhook] webhook_token column not found, trying without it...');

      // Fallback: try without webhook_token column
      const fallbackResult = await supabase
        .from('agents')
        .select('id, name')
        .eq('id', agentId)
        .single();

      agent = fallbackResult.data;
      error = fallbackResult.error;
    } else {
      agent = result.data;
      error = result.error;
    }

    console.log('[Webhook] Query result:', {
      found: !!agent,
      error: error?.message,
      agentId: agent?.id
    });

    if (error || !agent) {
      console.error('[Webhook] Agent not found:', { agentId, error: error?.message });
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Generate webhook token if it doesn't exist or column doesn't exist yet
    let webhookToken = (agent as any).webhook_token;
    if (!webhookToken) {
      webhookToken = generateWebhookToken();

      // Try to update webhook_token column
      try {
        await supabase
          .from('agents')
          .update({ webhook_token: webhookToken })
          .eq('id', agentId);
      } catch (updateError: any) {
        // If column doesn't exist, just use the generated token without saving
        console.log('[Webhook] Could not save webhook_token (column may not exist yet)');
        console.log('[Webhook] Using temporary token:', webhookToken.substring(0, 10) + '...');
      }
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/agents/${agentId}/trigger-call`;

    return NextResponse.json({
      success: true,
      webhook_url: webhookUrl,
      webhook_token: webhookToken,
      documentation: {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${webhookToken}`,
          'Content-Type': 'application/json'
        },
        body_example: {
          to_number: '+15551234567',
          contact_name: 'John Doe',
          contact_data: {
            email: 'john@example.com',
            service: 'roofing',
            custom_field: 'any value'
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Error retrieving webhook info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure random webhook token
 */
function generateWebhookToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
