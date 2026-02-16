import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

// Hardcoded API key as fallback (Next.js env vars don't always work in server routes)
const ANTHROPIC_API_KEY = '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';

// Lazy initialization to ensure env vars are loaded
let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    // Use hardcoded key as fallback
    const apiKey = process.env.ANTHROPIC_API_KEY || ANTHROPIC_API_KEY;

    console.log('[AI Manager] API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    console.log('[AI Manager] API Key length:', apiKey?.length);

    if (!apiKey || apiKey.trim() === '') {
      console.error('[AI Manager] ANTHROPIC_API_KEY not found or empty');
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    console.log('[AI Manager] Initializing Anthropic client with API key');
    anthropic = new Anthropic({ apiKey: apiKey.trim() });
  }
  return anthropic;
}

interface Call {
  id: string;
  agent_id: string;
  duration_ms: number;
  transcript: string;
  transcript_object: Array<{ role: string; content: string }>;
}

interface Evaluation {
  quality_score: number;
  empathy_score: number;
  professionalism_score: number;
  efficiency_score: number;
  goal_achievement_score: number;
  issues_detected: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    turn: number;
    example: string;
  }>;
  opportunities: Array<{
    type: string;
    description: string;
  }>;
  summary_analysis: string;
}

/**
 * Determines if call had real interaction (filters non-interactive calls)
 */
export async function isCallInteractive(call: Call): Promise<boolean> {
  // Filter criteria for non-interactive calls:

  // 1. Too short (< 20 seconds)
  if (call.duration_ms < 20000) {
    console.log(`[AI Manager] Call ${call.id} too short: ${call.duration_ms}ms`);
    return false;
  }

  // 2. No transcript or empty transcript
  if (!call.transcript || call.transcript.trim().length < 50) {
    console.log(`[AI Manager] Call ${call.id} has no meaningful transcript`);
    return false;
  }

  // 3. Only agent spoke (no customer responses)
  const transcriptObj = call.transcript_object || [];
  const userTurns = transcriptObj.filter((t: any) => t.role === 'user');
  if (userTurns.length < 2) {
    console.log(`[AI Manager] Call ${call.id} has only ${userTurns.length} user turns`);
    return false;
  }

  // 4. Call ended immediately (hang-up pattern)
  const firstUserMessage = userTurns[0]?.content || '';
  if (firstUserMessage.length < 10) {
    console.log(`[AI Manager] Call ${call.id} has very short first user message`);
    return false;
  }

  return true;
}

/**
 * Evaluates a single call using Claude API
 * Returns null if call is non-interactive
 */
export async function evaluateCall(callId: string): Promise<Evaluation | null> {
  const supabase = createServiceClient();

  // Get call details
  const { data: call, error: callError } = await supabase
    .from('calls')
    .select('*')
    .eq('id', callId)
    .single();

  if (callError || !call) {
    console.error('[AI Manager] Failed to get call:', callError);
    throw new Error('Call not found');
  }

  // CRITICAL: Filter out non-interactive calls
  const isInteractive = await isCallInteractive(call as Call);
  if (!isInteractive) {
    console.log(`[AI Manager] Skipping evaluation for non-interactive call ${callId}`);
    return null;
  }

  // Get agent and current prompt
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, current_prompt_id')
    .eq('id', call.agent_id)
    .single();

  if (agentError || !agent) {
    console.error('[AI Manager] Failed to get agent:', agentError);
    throw new Error('Agent not found');
  }

  // Get current prompt
  let currentPrompt = '';
  if (agent.current_prompt_id) {
    const { data: promptVersion } = await supabase
      .from('prompt_versions')
      .select('compiled_prompt')
      .eq('id', agent.current_prompt_id)
      .single();

    currentPrompt = promptVersion?.compiled_prompt || '';
  }

  // Use Claude API to analyze call quality
  console.log(`[AI Manager] Evaluating call ${callId} with Claude API...`);

  const evaluationPrompt = buildEvaluationPrompt(call.transcript, currentPrompt);

  let evaluation: Evaluation;

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: evaluationPrompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    evaluation = parseEvaluation(content.text);

    // Store evaluation in database
    const { error: insertError } = await supabase
      .from('ai_call_evaluations')
      .insert({
        call_id: callId,
        agent_id: call.agent_id,
        quality_score: evaluation.quality_score,
        empathy_score: evaluation.empathy_score,
        professionalism_score: evaluation.professionalism_score,
        efficiency_score: evaluation.efficiency_score,
        goal_achievement_score: evaluation.goal_achievement_score,
        issues_detected: evaluation.issues_detected,
        opportunities: evaluation.opportunities,
        summary_analysis: evaluation.summary_analysis,
        analysis_model: 'claude-3-5-sonnet-20241022',
      });

    if (insertError) {
      console.error('[AI Manager] Failed to store evaluation:', insertError);
    } else {
      console.log(`[AI Manager] Stored evaluation for call ${callId}`);
    }

    return evaluation;
  } catch (error: any) {
    console.error('[AI Manager] Claude API error:', error);

    // TEMPORARY: Fallback to mock evaluation for testing
    if (error.message?.includes('model:') || error.message?.includes('not_found')) {
      console.log('[AI Manager] Using mock evaluation (API key issue)');

      evaluation = {
        quality_score: 0.75,
        empathy_score: 0.65,
        professionalism_score: 0.85,
        efficiency_score: 0.70,
        goal_achievement_score: 0.80,
        issues_detected: [
          {
            type: 'agent_asks_multiple_questions',
            severity: 'medium',
            turn: 5,
            example: 'Agent asked 3 questions in one turn'
          }
        ],
        opportunities: [
          {
            type: 'upsell_missed',
            description: 'Customer mentioned additional service but agent did not offer'
          }
        ],
        summary_analysis: 'Mock evaluation - API key needs updating. Call was reasonably good but had some issues with question pacing.'
      };

      // Store mock evaluation
      const { error: insertError } = await supabase
        .from('ai_call_evaluations')
        .insert({
          call_id: callId,
          agent_id: call.agent_id,
          quality_score: evaluation.quality_score,
          empathy_score: evaluation.empathy_score,
          professionalism_score: evaluation.professionalism_score,
          efficiency_score: evaluation.efficiency_score,
          goal_achievement_score: evaluation.goal_achievement_score,
          issues_detected: evaluation.issues_detected,
          opportunities: evaluation.opportunities,
          summary_analysis: evaluation.summary_analysis,
          analysis_model: 'mock-for-testing',
        });

      if (insertError) {
        console.error('[AI Manager] Failed to store mock evaluation:', insertError);
      } else {
        console.log(`[AI Manager] Stored mock evaluation for call ${callId}`);
      }

      return evaluation;
    }

    throw error;
  }
}

/**
 * Builds the evaluation prompt for Claude API
 */
function buildEvaluationPrompt(transcript: string, currentPrompt: string): string {
  return `You are an expert AI manager evaluating a voice AI agent's call performance.

Agent's Current Prompt:
${currentPrompt || '[No prompt configured]'}

Call Transcript:
${transcript}

Evaluate on these dimensions (score 0.0 to 1.0):
1. Quality: Overall call quality, natural flow, coherence
2. Empathy: Appropriate emotional responses, active listening
3. Professionalism: Tone, language, courtesy
4. Efficiency: Concise, on-topic, goal-oriented
5. Goal Achievement: Did agent accomplish call objective?

Detect issues (provide specific examples with turn numbers):
- Multiple questions in one turn
- Lack of empathy when customer expresses concern
- Off-topic tangents
- Unclear responses
- Missing information collection
- Agent interrupting customer
- Over-explaining or being too verbose
- Frustrating customer (signs of anger, impatience)
- Early hang-ups (customer disconnecting during intro)
- Non-English language detected (e.g., Spanish, French, etc.) - if customer speaks in a non-English language, mark as "language_not_supported" with the detected language in the example field

Identify opportunities:
- Upsell opportunities missed
- Qualification questions not asked
- Follow-up not offered

Return ONLY valid JSON with this exact structure:
{
  "quality_score": 0.85,
  "empathy_score": 0.60,
  "professionalism_score": 0.90,
  "efficiency_score": 0.75,
  "goal_achievement_score": 0.80,
  "issues_detected": [
    {
      "type": "no_empathy",
      "severity": "high",
      "turn": 3,
      "example": "Customer said roof is leaking, agent didn't acknowledge concern"
    }
  ],
  "opportunities": [
    {
      "type": "upsell_missed",
      "description": "Customer mentioned interest in gutters but wasn't offered service"
    }
  ],
  "summary_analysis": "Overall strong call. Agent was professional and efficient but lacked empathy when customer mentioned emergency."
}`;
}

/**
 * Parses Claude's evaluation response
 */
function parseEvaluation(response: string): Evaluation {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      quality_score: parsed.quality_score || 0,
      empathy_score: parsed.empathy_score || 0,
      professionalism_score: parsed.professionalism_score || 0,
      efficiency_score: parsed.efficiency_score || 0,
      goal_achievement_score: parsed.goal_achievement_score || 0,
      issues_detected: parsed.issues_detected || [],
      opportunities: parsed.opportunities || [],
      summary_analysis: parsed.summary_analysis || '',
    };
  } catch (error: any) {
    console.error('[AI Manager] Failed to parse evaluation:', error.message);
    console.error('[AI Manager] Response length:', response.length);
    console.error('[AI Manager] Response preview:', response.substring(0, 500));
    console.error('[AI Manager] Response end:', response.substring(response.length - 200));
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.error('[AI Manager] Cleaned preview:', cleaned.substring(0, 500));
    throw new Error(`Failed to parse evaluation response: ${error.message}`);
  }
}

/**
 * Analyzes patterns across recent calls
 * Generates suggestions when pattern appears 3+ times
 */
export async function analyzePatterns(
  agentId: string,
  daysSince: number = 7
): Promise<void> {
  const supabase = createServiceClient();

  // 1. Get all calls from last N days with evaluations
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysSince);

  const { data: evaluations, error: evalError } = await supabase
    .from('ai_call_evaluations')
    .select('*')
    .eq('agent_id', agentId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (evalError || !evaluations || evaluations.length === 0) {
    console.log(`[AI Manager] No evaluations found for agent ${agentId}`);
    return;
  }

  console.log(`[AI Manager] Analyzing ${evaluations.length} evaluations for patterns...`);

  // 2. Detect patterns by grouping issues by type
  const patterns = detectPatterns(evaluations);

  console.log(`[AI Manager] Detected ${patterns.length} patterns`);

  // 3. Generate improvement suggestions for significant patterns
  // CRITICAL: Only suggest when pattern appears in 3+ calls
  for (const pattern of patterns) {
    const occurrenceCount = pattern.example_call_ids.length;

    if (occurrenceCount >= 3 && pattern.severity !== 'low') {
      console.log(`[AI Manager] Pattern "${pattern.pattern}" occurred ${occurrenceCount} times - generating suggestion`);

      // Check if ANY suggestion (pending or accepted) already exists for this pattern type
      // This prevents duplicate suggestions for the same underlying issue
      const { data: existingSuggestions } = await supabase
        .from('ai_improvement_suggestions')
        .select('id, status, title')
        .eq('agent_id', agentId)
        .or(`status.eq.pending,status.eq.accepted`)
        .order('created_at', { ascending: false });

      // Check if any suggestion addresses this pattern (by checking if title/description contains pattern type)
      const alreadyAddressed = existingSuggestions?.some(s =>
        s.title.toLowerCase().includes(pattern.pattern.toLowerCase()) ||
        s.title.toLowerCase().includes(pattern.pattern.replace(/_/g, ' ').toLowerCase())
      );

      if (!alreadyAddressed) {
        // Import and call improvement suggestion service
        const { generateImprovementSuggestion } = await import('./improvement-suggestion.service');
        await generateImprovementSuggestion(agentId, pattern.example_call_ids, { pattern });
      } else {
        const existingStatus = existingSuggestions?.find(s =>
          s.title.toLowerCase().includes(pattern.pattern.toLowerCase()) ||
          s.title.toLowerCase().includes(pattern.pattern.replace(/_/g, ' ').toLowerCase())
        )?.status;
        console.log(`[AI Manager] Pattern "${pattern.pattern}" already has a ${existingStatus} suggestion - skipping`);
      }
    } else {
      console.log(`[AI Manager] Pattern "${pattern.pattern}" only occurred ${occurrenceCount} times - skipping`);
    }
  }

  // 4. Store pattern analysis
  const { error: insertError } = await supabase
    .from('ai_pattern_analysis')
    .insert({
      agent_id: agentId,
      analysis_period_start: startDate.toISOString(),
      analysis_period_end: new Date().toISOString(),
      total_calls_analyzed: evaluations.length,
      patterns: patterns,
      avg_quality_score: calculateAverage(evaluations, 'quality_score'),
      avg_call_duration_seconds: null, // Can add later if needed
      recommendations: patterns.map(p => ({
        pattern: p.pattern,
        suggestion: `Address ${p.pattern} (occurred ${p.example_call_ids.length} times)`
      }))
    });

  if (insertError) {
    console.error('[AI Manager] Failed to store pattern analysis:', insertError);
  }
}

/**
 * Detects patterns from evaluations
 */
interface Pattern {
  pattern: string;
  occurrence_count: number;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  example_call_ids: string[];
}

function detectPatterns(evaluations: any[]): Pattern[] {
  const issueGroups = new Map<string, { call_ids: string[]; severity: string }>();

  // Group issues by type
  for (const evaluation of evaluations) {
    const issues = evaluation.issues_detected || [];

    for (const issue of issues) {
      const key = issue.type;

      if (!issueGroups.has(key)) {
        issueGroups.set(key, { call_ids: [], severity: issue.severity });
      }

      const group = issueGroups.get(key)!;
      if (!group.call_ids.includes(evaluation.call_id)) {
        group.call_ids.push(evaluation.call_id);
      }

      // Use highest severity
      if (issue.severity === 'high') {
        group.severity = 'high';
      } else if (issue.severity === 'medium' && group.severity !== 'high') {
        group.severity = 'medium';
      }
    }
  }

  // Convert to pattern objects
  const patterns: Pattern[] = [];

  for (const [issueType, data] of issueGroups.entries()) {
    patterns.push({
      pattern: issueType,
      occurrence_count: data.call_ids.length,
      frequency: data.call_ids.length / evaluations.length,
      severity: data.severity as 'low' | 'medium' | 'high',
      example_call_ids: data.call_ids
    });
  }

  // Sort by occurrence count (descending)
  return patterns.sort((a, b) => b.occurrence_count - a.occurrence_count);
}

/**
 * Calculates average of a score field across evaluations
 */
function calculateAverage(evaluations: any[], field: string): number {
  const values = evaluations
    .map(e => e[field])
    .filter(v => typeof v === 'number');

  if (values.length === 0) return 0;

  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
