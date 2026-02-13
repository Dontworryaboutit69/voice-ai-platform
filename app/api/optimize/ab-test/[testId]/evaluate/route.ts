import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// POST /api/optimize/ab-test/[testId]/evaluate
// Evaluates A/B test results and promotes winner
export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const { testId } = params;

    const supabase = createServiceClient();

    // Get A/B test
    const { data: abTest, error: testError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !abTest) {
      return NextResponse.json(
        { success: false, error: 'A/B test not found' },
        { status: 404 }
      );
    }

    // Get calls for control version
    const { data: controlCalls } = await supabase
      .from('calls')
      .select('*')
      .eq('prompt_version_id', abTest.control_version_id)
      .eq('ab_test_id', testId);

    // Get calls for test version
    const { data: testCalls } = await supabase
      .from('calls')
      .select('*')
      .eq('prompt_version_id', abTest.test_version_id)
      .eq('ab_test_id', testId);

    if (!controlCalls || !testCalls || controlCalls.length === 0 || testCalls.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Not enough data to evaluate',
        controlCalls: controlCalls?.length || 0,
        testCalls: testCalls?.length || 0
      }, { status: 400 });
    }

    // Calculate metrics for control
    const controlMetrics = {
      calls: controlCalls.length,
      avgSentiment: controlCalls.reduce((sum, c) => sum + (c.sentiment_score || 0.5), 0) / controlCalls.length,
      conversionRate: controlCalls.filter(c => c.conversion_successful).length / controlCalls.length,
      avgDuration: controlCalls.reduce((sum, c) => sum + (c.duration_ms || 0), 0) / controlCalls.length / 1000
    };

    // Calculate metrics for test
    const testMetrics = {
      calls: testCalls.length,
      avgSentiment: testCalls.reduce((sum, c) => sum + (c.sentiment_score || 0.5), 0) / testCalls.length,
      conversionRate: testCalls.filter(c => c.conversion_successful).length / testCalls.length,
      avgDuration: testCalls.reduce((sum, c) => sum + (c.duration_ms || 0), 0) / testCalls.length / 1000
    };

    // Determine winner
    let winner: 'control' | 'test' | 'inconclusive' = 'inconclusive';
    let promotedVersionId = null;

    // Test version wins if it improves both sentiment AND conversion
    const sentimentImproved = testMetrics.avgSentiment > controlMetrics.avgSentiment;
    const conversionImproved = testMetrics.conversionRate > controlMetrics.conversionRate;

    if (sentimentImproved && conversionImproved) {
      winner = 'test';
      promotedVersionId = abTest.test_version_id;
    } else if (!sentimentImproved && !conversionImproved) {
      winner = 'control';
      promotedVersionId = abTest.control_version_id;
    } else {
      // Mixed results - keep control
      winner = 'inconclusive';
      promotedVersionId = abTest.control_version_id;
    }

    // Update A/B test
    const { error: updateError } = await supabase
      .from('ab_tests')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        control_calls: controlMetrics.calls,
        test_calls: testMetrics.calls,
        control_avg_sentiment: controlMetrics.avgSentiment,
        test_avg_sentiment: testMetrics.avgSentiment,
        control_conversion_rate: controlMetrics.conversionRate,
        test_conversion_rate: testMetrics.conversionRate,
        control_avg_duration_seconds: Math.round(controlMetrics.avgDuration),
        test_avg_duration_seconds: Math.round(testMetrics.avgDuration),
        winner,
        promoted_version_id: promotedVersionId
      })
      .eq('id', testId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update A/B test' },
        { status: 500 }
      );
    }

    // If test version won, update agent's current prompt
    if (winner === 'test') {
      await supabase
        .from('agents')
        .update({ current_prompt_id: promotedVersionId })
        .eq('id', abTest.agent_id);
    }

    // Update optimization record
    await supabase
      .from('agent_optimizations')
      .update({
        status: 'completed',
        ab_test_ended_at: new Date().toISOString(),
        ab_test_results: {
          winner,
          controlMetrics,
          testMetrics
        }
      })
      .eq('id', abTest.optimization_id);

    return NextResponse.json({
      success: true,
      winner,
      promoted: winner === 'test',
      controlMetrics,
      testMetrics,
      improvements: {
        sentiment: ((testMetrics.avgSentiment - controlMetrics.avgSentiment) * 100).toFixed(1) + '%',
        conversion: ((testMetrics.conversionRate - controlMetrics.conversionRate) * 100).toFixed(1) + '%',
        duration: Math.round(testMetrics.avgDuration - controlMetrics.avgDuration) + 's'
      }
    });

  } catch (error: any) {
    console.error('Error evaluating A/B test:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
