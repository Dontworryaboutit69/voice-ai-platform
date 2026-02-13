import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// POST /api/optimize/[optimizationId]/accept
// Accepts optimization and starts A/B test
export async function POST(
  request: NextRequest,
  { params }: { params: { optimizationId: string } }
) {
  try {
    const { optimizationId } = params;

    const supabase = createServiceClient();

    // Get optimization
    const { data: optimization, error: optError } = await supabase
      .from('agent_optimizations')
      .select('*')
      .eq('id', optimizationId)
      .single();

    if (optError || !optimization) {
      return NextResponse.json(
        { success: false, error: 'Optimization not found' },
        { status: 404 }
      );
    }

    if (optimization.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Optimization already processed' },
        { status: 400 }
      );
    }

    // Get agent's current prompt version
    const { data: agent } = await supabase
      .from('agents')
      .select('current_prompt_id')
      .eq('id', optimization.agent_id)
      .single();

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create A/B test
    const testEndDate = new Date();
    testEndDate.setDate(testEndDate.getDate() + 7); // 7 days

    const { data: abTest, error: testError } = await supabase
      .from('ab_tests')
      .insert({
        agent_id: optimization.agent_id,
        optimization_id: optimization.id,
        control_version_id: agent.current_prompt_id,
        test_version_id: optimization.proposed_prompt_version_id,
        traffic_split_control: 75,
        traffic_split_test: 25,
        scheduled_end_at: testEndDate.toISOString(),
        status: 'running'
      })
      .select()
      .single();

    if (testError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create A/B test' },
        { status: 500 }
      );
    }

    // Update optimization status
    const { error: updateError } = await supabase
      .from('agent_optimizations')
      .update({
        status: 'ab_testing',
        ab_test_started_at: new Date().toISOString(),
        ab_test_control_version_id: agent.current_prompt_id,
        applied_at: new Date().toISOString()
      })
      .eq('id', optimizationId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update optimization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A/B test started successfully',
      abTest,
      testDuration: 7
    });

  } catch (error: any) {
    console.error('Error accepting optimization:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
