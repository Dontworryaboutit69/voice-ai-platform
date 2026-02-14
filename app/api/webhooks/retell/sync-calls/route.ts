import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

// Manual sync endpoint to fetch calls from Retell and sync to database
export async function POST(request: NextRequest) {
  try {
    console.log('[sync-calls] Starting sync - version 4.0 (fixed timestamp conversion)');
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
      .select('retell_agent_id, id')
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
    let skippedCount = 0;

    console.log(`[sync-calls] Processing ${callsList.length} calls from Retell API`);

    // Process each call
    for (const callRaw of callsList) {
      const call = callRaw as any; // Cast to any to work around Retell SDK type issues

      console.log(`[sync-calls] Call ${call.call_id}: agent=${call.agent_id}, status=${call.call_status}, end_timestamp=${call.end_timestamp}`);

      // CRITICAL: Filter out calls from other agents
      // Retell's filter_agent_id parameter doesn't work correctly, so we must filter here
      if (call.agent_id !== agent.retell_agent_id) {
        console.log(`[sync-calls] Skipping call ${call.call_id} - belongs to different agent ${call.agent_id}`);
        skippedCount++;
        continue;
      }

      // Check if call already exists in database
      const { data: existingCall } = await supabase
        .from('calls')
        .select('id, retell_call_id')
        .eq('retell_call_id', call.call_id)
        .single();

      // Normalize call status - Retell returns 'ended', 'error', 'completed', 'in_progress', 'ongoing'
      // We standardize to 'completed' or 'in_progress' for consistency
      let normalizedStatus = call.call_status;
      console.log(`[sync-calls] Call ${call.call_id} - Original status: ${normalizedStatus}`);

      if (normalizedStatus === 'ended' || normalizedStatus === 'error' || normalizedStatus === 'ongoing') {
        // If call has ended (even with error), mark as completed if it has transcript/recording
        normalizedStatus = (call.end_timestamp || call.transcript || call.recording_url) ? 'completed' : 'in_progress';
        console.log(`[sync-calls] Call ${call.call_id} - Normalized status from ${call.call_status} to ${normalizedStatus}`);
      }
      if (!normalizedStatus) {
        normalizedStatus = call.end_timestamp ? 'completed' : 'in_progress';
        console.log(`[sync-calls] Call ${call.call_id} - No status, using: ${normalizedStatus}`);
      }

      const callData = {
        retell_call_id: call.call_id,
        agent_id: agentId,
        from_number: call.from_number || null,
        to_number: call.to_number || null,
        started_at: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : new Date().toISOString(),
        ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
        duration_ms: call.call_duration_ms || call.duration_ms || null,
        transcript: typeof call.transcript === 'string' ? call.transcript : null,
        transcript_object: call.transcript_object || null,
        recording_url: call.recording_url || null,
        call_status: normalizedStatus,
        call_analysis: call.call_analysis || null
      };

      if (existingCall) {
        // Update existing call
        console.log(`[sync-calls] Updating existing call ${call.call_id}`);
        const { error: updateError } = await supabase
          .from('calls')
          .update(callData)
          .eq('id', existingCall.id);

        if (updateError) {
          console.error(`[sync-calls] Update error for ${call.call_id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`[sync-calls] Successfully updated call ${call.call_id}`);
        }
      } else {
        // Insert new call
        console.log(`[sync-calls] Inserting new call ${call.call_id}`);
        const { error: insertError } = await supabase
          .from('calls')
          .insert(callData);

        if (insertError) {
          console.error(`[sync-calls] Insert error for ${call.call_id}:`, insertError);
        } else {
          syncedCount++;
          console.log(`[sync-calls] Successfully inserted call ${call.call_id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} new calls, updated ${updatedCount} existing calls (skipped ${skippedCount} calls from other agents)`,
      syncedCount,
      updatedCount,
      skippedCount,
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
