import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface CallData {
  id: string;
  transcript: string;
  duration_ms: number;
  call_status: string;
  call_analysis?: any;
  started_at: string;
}

export interface AnalysisResult {
  callsAnalyzed: number;
  avgSentiment: number;
  conversionRate: number;
  avgCallDuration: number;
  successfulCalls: number;
  failedCalls: number;
  commonIssues: Array<{
    issue: string;
    description: string;
    frequency: number;
    impactScore: number;
    examples: string[];
  }>;
  successPatterns: Array<{
    pattern: string;
    description: string;
    frequency: number;
  }>;
  urgencyHandlingScore: number;
  questionEfficiencyScore: number;
}

export interface ImprovementProposal {
  changeSummary: string;
  proposedChanges: string;
  expectedImprovements: Array<{
    metric: string;
    currentValue: string;
    expectedValue: string;
  }>;
}

export async function analyzeCallsForOptimization(
  calls: CallData[],
  currentPrompt: string
): Promise<AnalysisResult> {

  if (calls.length === 0) {
    throw new Error('No calls to analyze');
  }

  // Prepare transcripts for analysis
  const transcriptSummaries = calls.slice(0, 20).map((call, idx) => ({
    callNumber: idx + 1,
    transcript: call.transcript,
    duration: Math.round(call.duration_ms / 1000),
    status: call.call_status
  }));

  const analysisPrompt = `You are an expert AI voice agent optimizer. Analyze these call transcripts to identify patterns, issues, and opportunities for improvement.

CURRENT AGENT PROMPT:
${currentPrompt}

CALL TRANSCRIPTS (${calls.length} total, showing ${transcriptSummaries.length}):
${JSON.stringify(transcriptSummaries, null, 2)}

Analyze and return a JSON object with this EXACT structure:
{
  "avgSentiment": 0.0-1.0,
  "conversionRate": 0.0-1.0,
  "commonIssues": [
    {
      "issue": "Brief issue name",
      "description": "Detailed explanation",
      "frequency": number (how many calls),
      "impactScore": 0.0-1.0,
      "examples": ["Quote from transcript 1", "Quote from transcript 2"]
    }
  ],
  "successPatterns": [
    {
      "pattern": "Brief pattern name",
      "description": "What the agent does well",
      "frequency": number (how many calls)
    }
  ],
  "urgencyHandlingScore": 0.0-1.0,
  "questionEfficiencyScore": 0.0-1.0
}

RULES:
- Only report issues that appear in 3+ calls
- Impact score should reflect how much it affects outcomes
- Be specific with examples
- Focus on actionable insights
- Sentiment: 0.0 = very negative, 1.0 = very positive
- Conversion: Did the agent achieve its goal?
- Urgency handling: How well does agent recognize and respond to urgent situations?
- Question efficiency: Does agent ask too many/few questions?

Return ONLY valid JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: analysisPrompt
      }]
    });

    const analysisText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse analysis JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Calculate actual metrics from calls
    const successfulCalls = calls.filter(c => c.call_status === 'completed').length;
    const failedCalls = calls.length - successfulCalls;
    const avgDuration = calls.reduce((sum, c) => sum + c.duration_ms, 0) / calls.length / 1000;

    return {
      callsAnalyzed: calls.length,
      avgSentiment: analysis.avgSentiment || 0.5,
      conversionRate: analysis.conversionRate || 0.5,
      avgCallDuration: Math.round(avgDuration),
      successfulCalls,
      failedCalls,
      commonIssues: analysis.commonIssues || [],
      successPatterns: analysis.successPatterns || [],
      urgencyHandlingScore: analysis.urgencyHandlingScore || 0.5,
      questionEfficiencyScore: analysis.questionEfficiencyScore || 0.5
    };

  } catch (error) {
    console.error('Error analyzing calls:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateImprovements(
  analysis: AnalysisResult,
  currentPrompt: string
): Promise<ImprovementProposal> {

  // Only proceed if there are significant issues
  const significantIssues = analysis.commonIssues.filter(
    issue => issue.frequency >= 3 && issue.impactScore >= 0.6
  );

  if (significantIssues.length === 0) {
    throw new Error('No significant issues found - optimization not needed');
  }

  const improvementPrompt = `You are an expert at optimizing AI voice agent prompts. Given the analysis below, generate specific improvements to the current prompt.

CURRENT PROMPT:
${currentPrompt}

ANALYSIS:
- Calls analyzed: ${analysis.callsAnalyzed}
- Avg sentiment: ${(analysis.avgSentiment * 100).toFixed(0)}%
- Conversion rate: ${(analysis.conversionRate * 100).toFixed(0)}%

ISSUES TO FIX:
${significantIssues.map((issue, idx) => `
${idx + 1}. ${issue.issue} (${issue.frequency} calls, impact: ${(issue.impactScore * 100).toFixed(0)}%)
   ${issue.description}
   Examples:
   ${issue.examples.map(ex => `   - "${ex}"`).join('\n')}
`).join('\n')}

WHAT'S WORKING WELL:
${analysis.successPatterns.map(p => `- ${p.pattern}: ${p.description}`).join('\n')}

Generate improvements and return a JSON object with this EXACT structure:
{
  "changeSummary": "Brief 1-2 sentence summary of changes",
  "proposedChanges": "The full updated prompt text with improvements incorporated",
  "expectedImprovements": [
    {
      "metric": "Metric name (e.g., 'Call duration', 'Sentiment')",
      "currentValue": "Current value",
      "expectedValue": "Expected after improvement"
    }
  ]
}

RULES:
- Keep what's working well
- Make targeted fixes to the identified issues
- Don't change the core personality or role
- Be specific and actionable
- Maintain the same prompt structure
- Expected improvements should be realistic (5-20% gains)

Return ONLY valid JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: improvementPrompt
      }]
    });

    const improvementText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Parse JSON from response
    const jsonMatch = improvementText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse improvement JSON');
    }

    const improvement = JSON.parse(jsonMatch[0]);

    return {
      changeSummary: improvement.changeSummary,
      proposedChanges: improvement.proposedChanges,
      expectedImprovements: improvement.expectedImprovements || []
    };

  } catch (error) {
    console.error('Error generating improvements:', error);
    throw new Error(`Improvement generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function hasSignificantIssues(analysis: AnalysisResult): boolean {
  const significantIssues = analysis.commonIssues.filter(
    issue => issue.frequency >= 3 && issue.impactScore >= 0.6
  );
  return significantIssues.length > 0;
}
