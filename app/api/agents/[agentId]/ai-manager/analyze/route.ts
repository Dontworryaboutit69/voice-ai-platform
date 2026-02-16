import { NextResponse } from 'next/server';
import { analyzePatterns } from '@/lib/services/ai-manager.service';

/**
 * POST /api/agents/[agentId]/ai-manager/analyze
 * Manually trigger pattern analysis for an agent
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

    console.log(`[ai-manager/analyze] Analyzing patterns for agent ${agentId} (last ${daysSince} days)`);

    // Run pattern analysis
    await analyzePatterns(agentId, daysSince);

    return NextResponse.json({
      success: true,
      message: `Pattern analysis completed for last ${daysSince} days`,
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
    const { createServiceClient } = await import('@/lib/supabase/client');
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
