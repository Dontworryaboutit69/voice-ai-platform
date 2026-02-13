import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// POST /api/optimize/[optimizationId]/reject
// Rejects optimization proposal
export async function POST(
  request: NextRequest,
  { params }: { params: { optimizationId: string } }
) {
  try {
    const { optimizationId } = params;
    const body = await request.json();
    const { feedback } = body;

    const supabase = createServiceClient();

    // Update optimization status
    const { data, error } = await supabase
      .from('agent_optimizations')
      .update({
        status: 'rejected',
        user_feedback: feedback || 'User rejected without feedback'
      })
      .eq('id', optimizationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to reject optimization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Optimization rejected',
      optimization: data
    });

  } catch (error: any) {
    console.error('Error rejecting optimization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
