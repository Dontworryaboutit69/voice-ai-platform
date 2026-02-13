import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

// Manual sync endpoint to fetch calls from Retell and sync to database
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
      .select('retell_agent_id, id, user_id')
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

    // Fetch calls from Retell for this agent
    const callsList = await retell.call.list({
      filter_agent_id: agent.retell_agent_id,
      limit: 100, // Fetch last 100 calls
      sort_order: 'descending'
    } as any);

    let syncedCount = 0;
    let updatedCount = 0;

    // Process each call
    for (const callRaw of callsList) {
      const call = callRaw as any; // Cast to any to work around Retell SDK type issues

      // Check if call already exists in database
      const { data: existingCall } = await supabase
        .from('calls')
        .select('id, retell_call_id')
        .eq('retell_call_id', call.call_id)
        .single();

      const callData = {
        retell_call_id: call.call_id,
        agent_id: agentId,
        user_id: agent.user_id,
        from_number: call.from_number || null,
        to_number: call.to_number || null,
        retell_agent_id: call.agent_id || null,
        started_at: call.start_timestamp || new Date().toISOString(),
        ended_at: call.end_timestamp || null,
        duration_ms: call.call_duration_ms || call.duration_ms || null,
        transcript: typeof call.transcript === 'string' ? call.transcript : null,
        transcript_object: call.transcript_object || null,
        recording_url: call.recording_url || null,
        public_log_url: call.public_log_url || null,
        call_status: call.call_status || (call.end_timestamp ? 'completed' : 'in_progress'),
        disconnection_reason: call.disconnection_reason || null,
        call_analysis: call.call_analysis || null,
        call_summary: call.call_analysis?.call_summary || null,
        sentiment: call.call_analysis?.user_sentiment || null,
        metadata: call.metadata || {}
      };

      if (existingCall) {
        // Update existing call
        const { error: updateError } = await supabase
          .from('calls')
          .update(callData)
          .eq('id', existingCall.id);

        if (!updateError) {
          updatedCount++;
        }
      } else {
        // Insert new call
        const { error: insertError } = await supabase
          .from('calls')
          .insert(callData);

        if (!insertError) {
          syncedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new calls, updated ${updatedCount} existing calls`,
      syncedCount,
      updatedCount,
      totalProcessed: callsList.length
    });

  } catch (error: any) {
    console.error('Error syncing calls from Retell:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync calls' },
      { status: 500 }
    );
  }
}
