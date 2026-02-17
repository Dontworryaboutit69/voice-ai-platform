import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { updateRetellAgentTools } from '@/lib/retell-tools';

/**
 * Sync Retell agent custom tools based on active integrations
 * This endpoint should be called:
 * - After connecting/disconnecting an integration
 * - When updating integration settings
 * - Manually via dashboard "Sync Tools" button
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    console.log(`[sync-retell-tools] Syncing tools for agent ${agentId}`);

    const supabase = createServiceClient();

    // Get agent's Retell ID
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('retell_agent_id')
      .eq('id', agentId)
      .single();

    if (agentError || !agent?.retell_agent_id) {
      console.error('[sync-retell-tools] Agent not found or no Retell ID');
      return NextResponse.json(
        { success: false, error: 'Agent not found or not connected to Retell' },
        { status: 404 }
      );
    }

    // Get all active integrations
    const { data: integrations, error: intError } = await supabase
      .from('integration_connections')
      .select('integration_type')
      .eq('agent_id', agentId)
      .eq('is_active', true);

    if (intError) {
      console.error('[sync-retell-tools] Error fetching integrations:', intError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    const integrationTypes = (integrations || []).map(i => i.integration_type);
    console.log(`[sync-retell-tools] Active integrations:`, integrationTypes);

    // Update Retell agent tools
    const result = await updateRetellAgentTools(
      agent.retell_agent_id,
      agentId,
      integrationTypes
    );

    if (!result.success) {
      console.error('[sync-retell-tools] Failed to update tools:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`[sync-retell-tools] ✅ Successfully synced tools`);

    return NextResponse.json({
      success: true,
      message: 'Tools synced successfully',
      integrations: integrationTypes
    });

  } catch (error: any) {
    console.error('[sync-retell-tools] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync tools' },
      { status: 500 }
    );
  }
}
