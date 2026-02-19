import { NextRequest, NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

// Manual sync endpoint to fetch calls from Retell and sync to database
export async function POST(request: NextRequest) {
  try {
    console.log('[sync-calls] Starting sync - version 5.0 (with integration sync)');
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
    const callsToSync: string[] = []; // Track calls that need integration sync

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

      // Extract latency and cost data for dashboard analytics
      const latency = (call as any).latency;
      const callCost = (call as any).call_cost;
      const callAnalysis = call.call_analysis as any;

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
        call_analysis: call.call_analysis || null,
        // Dashboard analytics fields
        disconnection_reason: (call as any).disconnection_reason || null,
        transfer_destination: (call as any).transfer_destination || null,
        e2e_latency_p50: latency?.e2e?.p50 ?? null,
        e2e_latency_p90: latency?.e2e?.p90 ?? null,
        e2e_latency_p99: latency?.e2e?.p99 ?? null,
        call_cost_cents: callCost?.combined_cost ?? null,
        user_sentiment: callAnalysis?.user_sentiment ?? null,
        call_successful: callAnalysis?.call_successful ?? null,
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
          // Track for integration sync
          if (normalizedStatus === 'completed' && call.transcript) {
            callsToSync.push(existingCall.id);
          }
        }
      } else {
        // Insert new call
        console.log(`[sync-calls] Inserting new call ${call.call_id}`);
        const { data: newCall, error: insertError } = await supabase
          .from('calls')
          .insert(callData)
          .select('id')
          .single();

        if (insertError) {
          console.error(`[sync-calls] Insert error for ${call.call_id}:`, insertError);
        } else {
          syncedCount++;
          console.log(`[sync-calls] Successfully inserted call ${call.call_id}`);
          // Track for integration sync
          if (newCall && normalizedStatus === 'completed' && call.transcript) {
            callsToSync.push(newCall.id);
          }
        }
      }
    }

    // Sync completed calls to integrations (async, don't wait)
    if (callsToSync.length > 0) {
      console.log(`[sync-calls] Triggering integration sync for ${callsToSync.length} completed calls`);
      syncCallsToIntegrations(callsToSync, agentId).catch(error => {
        console.error('[sync-calls] Integration sync error (non-blocking):', error);
      });
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

/**
 * Sync calls to CRM integrations (async, non-blocking)
 */
async function syncCallsToIntegrations(callIds: string[], agentId: string) {
  try {
    console.log('[sync-calls] Syncing calls to integrations:', callIds);

    const supabase = createServiceClient();

    for (const callId of callIds) {
      // Get call details
      const { data: call } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (!call || !call.transcript_object) {
        console.log('[sync-calls] Skipping call without transcript:', callId);
        continue;
      }

      // Analyze call to extract customer data (same logic as call-events webhook)
      const outcome = analyzeCallTranscript(call.transcript_object);

      // Build call data for integrations
      const integrationCallData = {
        callId: call.id,
        agentId: agentId,
        customerName: outcome.customerName,
        customerPhone: outcome.customerPhone,
        customerEmail: outcome.customerEmail,
        callOutcome: outcome.type,
        callSummary: `Call with ${outcome.customerName || 'customer'}. ${outcome.reason || outcome.service || 'No additional details.'}`,
        callSentiment: 'neutral',
        transcript: call.transcript,
        recordingUrl: call.recording_url,
        startedAt: new Date(call.started_at),
        endedAt: call.ended_at ? new Date(call.ended_at) : new Date(),
        durationSeconds: call.duration_ms ? Math.floor(call.duration_ms / 1000) : 0,
      };

      // Import integration factory
      const { processCallThroughIntegrations } = await import('@/lib/integrations/integration-factory');

      // Process through all connected integrations
      await processCallThroughIntegrations(agentId, integrationCallData);

      console.log('[sync-calls] ✅ Synced call to integrations:', callId);
    }
  } catch (error: any) {
    console.error('[sync-calls] Integration sync error:', error);
  }
}

/**
 * Simplified transcript analysis (mirrors logic in call-events webhook)
 */
function analyzeCallTranscript(transcript: any): {
  type: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  reason?: string;
  service?: string;
} {
  let customerName: string | undefined;
  let customerPhone: string | undefined;
  let customerEmail: string | undefined;
  let reason: string | undefined;

  if (!Array.isArray(transcript)) {
    return { type: 'other' };
  }

  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    const content = turn.content?.toLowerCase() || '';
    const userContent = turn.role === 'user' ? (turn.content || '') : '';

    // Extract name
    if (!customerName && turn.role === 'user') {
      if (content.includes('my name is') || content.includes("i'm ")) {
        const cleaned = userContent
          .replace(/my name is /i, '')
          .replace(/i'm /i, '')
          .replace(/this is /i, '')
          .trim();
        const words = cleaned.split(/\s+/).slice(0, 3);
        if (words.length > 0 && words[0].length > 1) {
          customerName = words.join(' ');
        }
      }
    }

    // Extract phone
    if (!customerPhone && turn.role === 'user') {
      const phoneMatch = userContent.match(/(\+?1?\s*\(?[\d]{3}\)?[\s.-]?[\d]{3}[\s.-]?[\d]{4})/);
      if (phoneMatch) customerPhone = phoneMatch[1].trim();
    }

    // Extract email
    if (!customerEmail && turn.role === 'user') {
      const emailMatch = userContent.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) customerEmail = emailMatch[0].trim();
    }

    // Extract reason (from early user messages)
    if (!reason && i < 3 && turn.role === 'user' && userContent.length > 10) {
      reason = userContent.substring(0, 100);
    }
  }

  return {
    type: customerName && customerPhone ? 'message_taken' : 'other',
    customerName,
    customerPhone,
    customerEmail,
    reason,
  };
}
