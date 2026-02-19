import { NextResponse } from 'next/server';
import { analyzePatterns, evaluateCall } from '@/lib/services/ai-manager.service';
import { createServiceClient } from '@/lib/supabase/client';

/**
 * POST /api/agents/[agentId]/ai-manager/analyze
 * Manually trigger call evaluation + pattern analysis for an agent.
 *
 * Step 1: Find all calls that haven't been evaluated yet and evaluate them.
 * Step 2: Run pattern analysis across all evaluations to generate suggestions.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    let daysSince = 7;

    try {
      const body = await request.json();
      daysSince = body.daysSince || 7;
    } catch {
      // No body provided, use default
    }

    const supabase = createServiceClient();

    // Step 1: Evaluate any un-evaluated calls
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysSince);

    // Get all completed calls with transcripts in the time window
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('id')
      .eq('agent_id', agentId)
      .eq('call_status', 'completed')
      .not('transcript', 'is', null)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (callsError) {
      console.error('[ai-manager/analyze] Error fetching calls:', callsError);
      return NextResponse.json(
        { error: 'Failed to fetch calls' },
        { status: 500 }
      );
    }

    // Get already-evaluated call IDs
    const { data: existingEvals } = await supabase
      .from('ai_call_evaluations')
      .select('call_id')
      .eq('agent_id', agentId)
      .gte('created_at', startDate.toISOString());

    const evaluatedCallIds = new Set((existingEvals || []).map(e => e.call_id));

    // Filter to un-evaluated calls
    const unevaluatedCalls = (calls || []).filter(c => !evaluatedCallIds.has(c.id));

    console.log(`[ai-manager/analyze] Found ${calls?.length || 0} calls, ${unevaluatedCalls.length} need evaluation`);

    // Evaluate each un-evaluated call
    let evaluatedCount = 0;
    let evalErrors = 0;
    for (const call of unevaluatedCalls) {
      try {
        console.log(`[ai-manager/analyze] Evaluating call ${call.id}...`);
        await evaluateCall(call.id);
        evaluatedCount++;
      } catch (error) {
        evalErrors++;
        console.error(`[ai-manager/analyze] Failed to evaluate call ${call.id}:`, error);
        // Continue with other calls
      }
    }

    console.log(`[ai-manager/analyze] Evaluated ${evaluatedCount} calls (${evalErrors} errors)`);

    // Step 2: Run pattern analysis across all evaluations
    console.log(`[ai-manager/analyze] Running pattern analysis for agent ${agentId} (last ${daysSince} days)`);
    await analyzePatterns(agentId, daysSince);

    return NextResponse.json({
      success: true,
      message: `Evaluated ${evaluatedCount} calls, then ran pattern analysis for last ${daysSince} days`,
      evaluated: evaluatedCount,
      errors: evalErrors,
      totalCalls: calls?.length || 0,
    });
  } catch (error) {
    console.error('[ai-manager/analyze POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/[agentId]/ai-manager/analyze
 * Get recent pattern analysis results
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    const { data: analyses, error } = await supabase
      .from('ai_pattern_analysis')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[ai-manager/analyze GET] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pattern analyses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('[ai-manager/analyze GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
