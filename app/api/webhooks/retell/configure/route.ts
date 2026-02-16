import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

// Endpoint to verify and update webhook configuration for an agent
export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get agent's Retell agent ID
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('retell_agent_id, business_name')
      .eq('id', agentId)
      .single();

    if (agentError || !agent || !agent.retell_agent_id) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or not connected to Retell' },
        { status: 404 }
      );
    }

    // Initialize Retell client
    const retell = new Retell({
      apiKey: RETELL_API_KEY,
    });

    // Configure webhook URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const webhookUrl = `${appUrl}/api/webhooks/retell/call-events`;

    // Get current agent configuration from Retell
    const retellAgent = await retell.agent.retrieve(agent.retell_agent_id);

    // Update agent with webhook URL
    await retell.agent.update(agent.retell_agent_id, {
      webhook_url: webhookUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook URL configured successfully',
      agentId: agent.retell_agent_id,
      previousWebhook: retellAgent.webhook_url || 'Not set',
      newWebhook: webhookUrl,
      note: 'All future calls will now be automatically synced to the database'
    });

  } catch (error: any) {
    console.error('Error configuring webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to configure webhook' },
      { status: 500 }
    );
  }
}
