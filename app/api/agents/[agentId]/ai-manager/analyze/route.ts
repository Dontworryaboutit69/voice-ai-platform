import { NextResponse } from 'next/server';
import { runBatchAnalysis } from '@/lib/services/ai-manager.service';
import { createServiceClient } from '@/lib/supabase/client';

// Allow up to 60 seconds for this endpoint (Vercel Pro allows up to 300s)
export const maxDuration = 60;

/**
 * POST /api/agents/[agentId]/ai-manager/analyze
 * Run a batch analysis on recent calls.
 * Makes 2 Claude API calls total (~15-25 seconds).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    let callCount = 10;
    let daysSince = 7;

    try {
      const body = await request.json();
      callCount = body.callCount || 10;
      daysSince = body.daysSince || 7;
    } catch {
      // No body provided, use defaults
    }

    console.log(`[ai-manager/analyze POST] Running batch analysis for agent ${agentId} (${callCount} calls, ${daysSince} days)`);

    const result = await runBatchAnalysis(agentId, { callCount, daysSince });

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error: any) {
    console.error('[ai-manager/analyze POST] Error:', error);
    const errorMsg = error?.message || error?.toString() || 'Unknown error';

    // Specific error messages for known issues
    if (errorMsg.includes('credit balance') || errorMsg.includes('billing')) {
      return NextResponse.json(
        { error: 'Anthropic API credits exhausted. Please add credits to your Anthropic account.' },
        { status: 402 }
      );
    }

    if (errorMsg.includes('No completed calls') || errorMsg.includes('interactive calls found')) {
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
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
 * Get recent batch analysis results.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    // Return both new batch analyses and legacy pattern analyses
    const { data: batchAnalyses, error: batchError } = await supabase
      .from('ai_batch_analyses')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (batchError) {
      // If table doesn't exist yet, fall back to legacy
      console.warn('[ai-manager/analyze GET] Batch query error:', batchError.message);
    }

    // Also get legacy pattern analyses for backward compat
    const { data: legacyAnalyses } = await supabase
      .from('ai_pattern_analysis')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      analyses: batchAnalyses || [],
      legacyAnalyses: legacyAnalyses || [],
    });
  } catch (error) {
    console.error('[ai-manager/analyze GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
