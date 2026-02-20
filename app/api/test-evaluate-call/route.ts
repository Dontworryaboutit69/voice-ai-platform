import { NextResponse } from 'next/server';
import { runBatchAnalysis } from '@/lib/services/ai-manager.service';

/**
 * Test endpoint for AI Manager batch analysis.
 * Usage: GET /api/test-evaluate-call?agentId=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    console.log(`[Test] Running batch analysis for agent ${agentId}...`);

    const result = await runBatchAnalysis(agentId, { callCount: 5, daysSince: 7 });

    return NextResponse.json({
      message: 'Batch analysis completed',
      agentId,
      result,
    });
  } catch (error: any) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
