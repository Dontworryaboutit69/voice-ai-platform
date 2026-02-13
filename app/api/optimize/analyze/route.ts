import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { analyzeCallsForOptimization, generateImprovements, hasSignificantIssues } from '@/lib/services/optimization-analyzer.service';

// POST /api/optimize/analyze
// Analyzes last week's calls and creates optimization proposal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id } = body;

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'Missing agent_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get agent with current prompt
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        current_prompt:prompt_versions!agents_current_prompt_id_fkey(*)
      `)
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get last week's calls
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('*')
      .eq('agent_id', agent_id)
      .gte('started_at', oneWeekAgo.toISOString())
      .order('started_at', { ascending: false });

    if (callsError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calls' },
        { status: 500 }
      );
    }

    // Need at least 10 calls to analyze
    if (!calls || calls.length < 10) {
      return NextResponse.json({
        success: true,
        needsMoreCalls: true,
        message: `Need at least 10 calls to analyze. Current: ${calls?.length || 0}`
      });
    }

    // Analyze calls
    const analysis = await analyzeCallsForOptimization(
      calls,
      agent.current_prompt?.compiled_prompt || ''
    );

    // Check if significant issues found
    if (!hasSignificantIssues(analysis)) {
      // Create optimization record but mark as no changes needed
      const { data: optimization } = await supabase
        .from('agent_optimizations')
        .insert({
          agent_id,
          analysis_period_start: oneWeekAgo.toISOString(),
          analysis_period_end: new Date().toISOString(),
          calls_analyzed: analysis.callsAnalyzed,
          avg_sentiment: analysis.avgSentiment,
          conversion_rate: analysis.conversionRate,
          avg_call_duration_seconds: analysis.avgCallDuration,
          total_calls_successful: analysis.successfulCalls,
          total_calls_failed: analysis.failedCalls,
          common_issues: analysis.commonIssues,
          success_patterns: analysis.successPatterns,
          urgency_handling_score: analysis.urgencyHandlingScore,
          question_efficiency_score: analysis.questionEfficiencyScore,
          status: 'skipped',
          change_summary: 'No significant issues found'
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        noImprovementsNeeded: true,
        analysis,
        optimization
      });
    }

    // Generate improvements
    const improvements = await generateImprovements(
      analysis,
      agent.current_prompt?.compiled_prompt || ''
    );

    // Create new prompt version
    const { data: newPromptVersion, error: promptError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id,
        version_number: (agent.current_prompt?.version_number || 0) + 1,
        prompt_role: agent.current_prompt?.prompt_role || '',
        prompt_personality: agent.current_prompt?.prompt_personality || '',
        prompt_call_flow: agent.current_prompt?.prompt_call_flow || '',
        prompt_info_recap: agent.current_prompt?.prompt_info_recap || '',
        prompt_functions: agent.current_prompt?.prompt_functions || [],
        prompt_knowledge: agent.current_prompt?.prompt_knowledge || '',
        compiled_prompt: improvements.proposedChanges,
        generation_method: 'auto_optimized',
        parent_version_id: agent.current_prompt?.id,
        change_summary: improvements.changeSummary
      })
      .select()
      .single();

    if (promptError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create prompt version' },
        { status: 500 }
      );
    }

    // Create optimization record
    const { data: optimization, error: optError } = await supabase
      .from('agent_optimizations')
      .insert({
        agent_id,
        analysis_period_start: oneWeekAgo.toISOString(),
        analysis_period_end: new Date().toISOString(),
        calls_analyzed: analysis.callsAnalyzed,
        avg_sentiment: analysis.avgSentiment,
        conversion_rate: analysis.conversionRate,
        avg_call_duration_seconds: analysis.avgCallDuration,
        total_calls_successful: analysis.successfulCalls,
        total_calls_failed: analysis.failedCalls,
        common_issues: analysis.commonIssues,
        success_patterns: analysis.successPatterns,
        urgency_handling_score: analysis.urgencyHandlingScore,
        question_efficiency_score: analysis.questionEfficiencyScore,
        proposed_prompt_changes: improvements.proposedChanges,
        proposed_prompt_version_id: newPromptVersion.id,
        change_summary: improvements.changeSummary,
        expected_improvements: improvements.expectedImprovements,
        status: 'pending'
      })
      .select()
      .single();

    if (optError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create optimization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      improvements,
      optimization,
      newPromptVersion
    });

  } catch (error: any) {
    console.error('Error in optimize/analyze:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
