import { NextResponse } from 'next/server';
import { analyzePatterns, evaluateCall } from '@/lib/services/ai-manager.service';
import { createServiceClient } from '@/lib/supabase/client';

// Allow up to 60 seconds for this endpoint (Vercel Pro allows up to 300s)
export const maxDuration = 60;

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
    const startTime = Date.now();
    // Each Claude call takes 5-15s. Reserve 20s for the last eval + pattern analysis.
    const MAX_EVAL_MS = 35000;
    const MAX_TOTAL_MS = 50000;

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

    console.log(`[ai-manager/analyze] Found ${calls?.length || 0} calls, ${evaluatedCallIds.size} already evaluated, ${unevaluatedCalls.length} need evaluation`);

    // Evaluate each un-evaluated call (with timeout guard)
    let evaluatedCount = 0;
    let skippedCount = 0;
    let evalErrors = 0;
    let timedOut = false;
    let apiBillingError = false;

    for (const call of unevaluatedCalls) {
      // Check if we're running low on time for evaluations
      if (Date.now() - startTime > MAX_EVAL_MS) {
        const remaining = unevaluatedCalls.length - evaluatedCount - evalErrors - skippedCount;
        console.log(`[ai-manager/analyze] Approaching eval time limit (${Math.round((Date.now() - startTime) / 1000)}s), stopping. ${remaining} calls remaining.`);
        timedOut = true;
        break;
      }

      try {
        console.log(`[ai-manager/analyze] Evaluating call ${call.id}...`);
        const result = await evaluateCall(call.id);
        if (result === null) {
          skippedCount++; // Non-interactive call
        } else {
          evaluatedCount++;
        }
      } catch (error: any) {
        evalErrors++;
        console.error(`[ai-manager/analyze] Failed to evaluate call ${call.id}:`, error);

        // If it's a billing/auth error, stop immediately — no point retrying
        const errorMsg = error?.message || error?.toString() || '';
        if (errorMsg.includes('credit balance') || errorMsg.includes('401') || errorMsg.includes('authentication')) {
          apiBillingError = true;
          console.error('[ai-manager/analyze] API billing/auth error detected — stopping all evaluations');
          break;
        }
      }
    }

    console.log(`[ai-manager/analyze] Evaluated ${evaluatedCount} calls, skipped ${skippedCount}, errors ${evalErrors}`);

    // If billing error, return a clear message immediately
    if (apiBillingError) {
      return NextResponse.json({
        success: false,
        error: 'Anthropic API credits exhausted. Please add credits to your Anthropic account, then try again.',
        evaluated: evaluatedCount,
        errors: evalErrors,
        totalCalls: calls?.length || 0,
      }, { status: 402 });
    }

    // Step 2: Run pattern analysis across all evaluations (only if we have time)
    let patternsRan = false;
    let patternError: string | null = null;
    if (Date.now() - startTime < MAX_TOTAL_MS) {
      console.log(`[ai-manager/analyze] Running pattern analysis for agent ${agentId} (last ${daysSince} days)`);
      try {
        await analyzePatterns(agentId, daysSince);
        patternsRan = true;
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || '';
        console.error('[ai-manager/analyze] Pattern analysis failed:', errorMsg);
        if (errorMsg.includes('credit balance')) {
          patternError = 'Anthropic API credits exhausted during suggestion generation.';
        } else {
          patternError = `Pattern analysis failed: ${errorMsg.substring(0, 200)}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: timedOut
        ? `Evaluated ${evaluatedCount} calls before timeout. Run analysis again to continue.`
        : `Evaluated ${evaluatedCount} calls, then ran pattern analysis for last ${daysSince} days`,
      evaluated: evaluatedCount,
      skipped: skippedCount,
      errors: evalErrors,
      totalCalls: calls?.length || 0,
      previouslyEvaluated: evaluatedCallIds.size,
      patternsAnalyzed: patternsRan,
      patternError,
      timedOut,
    });
  } catch (error: any) {
    console.error('[ai-manager/analyze POST] Error:', error);
    const errorMsg = error?.message || error?.toString() || 'Unknown error';

    // Provide specific error messages for known issues
    if (errorMsg.includes('credit balance')) {
      return NextResponse.json(
        { error: 'Anthropic API credits exhausted. Please add credits to your Anthropic account.' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: `Analysis failed: ${errorMsg.substring(0, 300)}` },
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
