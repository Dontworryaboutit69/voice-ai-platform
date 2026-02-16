import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

/**
 * GET /api/agents/[agentId]/ai-manager/evaluations
 * Get all call evaluations for an agent
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createServiceClient();

    const { data: evaluations, error } = await supabase
      .from('ai_call_evaluations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ai-manager/evaluations GET] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch evaluations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error('[ai-manager/evaluations GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
