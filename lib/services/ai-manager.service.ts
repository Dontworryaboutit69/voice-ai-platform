import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Call {
  id: string;
  agent_id: string;
  duration_ms: number;
  transcript: string;
  transcript_object: Array<{ role: string; content: string }>;
  created_at: string;
}

interface BatchAnalysisResult {
  id: string;
  overall_quality_score: number;
  strengths: Array<{ label: string; detail: string }>;
  top_issues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    target_section: string;
    fix_guidance: string;
    evidence: string[];
  }>;
  calls_analyzed: number;
  calls_skipped: number;
  suggestion_id: string | null;
}

interface BatchAnalysisOptions {
  callCount?: number;
  daysSince?: number;
}

// ─── Utility: Filter non-interactive calls ───────────────────────────────────

/**
 * Determines if call had real interaction (filters non-interactive calls).
 * Pure in-memory check — no Claude call needed.
 */
export function isCallInteractive(call: Call): boolean {
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

  return true;
}

/**
 * Calculates average of a score field across records
 */
function calculateAverage(records: any[], field: string): number {
  const values = records
    .map(e => e[field])
    .filter(v => typeof v === 'number');

  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ─── Core: Batch Analysis ────────────────────────────────────────────────────

/**
 * Run a batch analysis on recent calls for an agent.
 * Makes 1-2 Claude API calls total:
 *   1. Batch analysis (~$0.03-0.05): All transcripts + prompt → quality score, issues, strengths
 *   2. Section rewrite (~$0.02-0.03): If issues found, rewrites the most impactful section
 */
export async function runBatchAnalysis(
  agentId: string,
  options: BatchAnalysisOptions = {}
): Promise<BatchAnalysisResult> {
  const { callCount = 10, daysSince = 7 } = options;
  const supabase = createServiceClient();

  console.log(`[AI Manager] Starting batch analysis for agent ${agentId} (last ${callCount} calls, ${daysSince} days)`);

  // 1. Fetch recent calls with transcripts
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysSince);

  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('id, agent_id, duration_ms, transcript, transcript_object, created_at')
    .eq('agent_id', agentId)
    .eq('call_status', 'completed')
    .not('transcript', 'is', null)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(callCount);

  if (callsError) {
    console.error('[AI Manager] Failed to fetch calls:', callsError);
    throw new Error('Failed to fetch calls for analysis');
  }

  if (!calls || calls.length === 0) {
    throw new Error('No completed calls found in the specified time period');
  }

  // 2. Filter non-interactive calls in memory
  const interactiveCalls = calls.filter(c => isCallInteractive(c as Call));
  const skippedCount = calls.length - interactiveCalls.length;

  console.log(`[AI Manager] ${calls.length} total calls, ${interactiveCalls.length} interactive, ${skippedCount} skipped`);

  if (interactiveCalls.length < 1) {
    throw new Error(`Only ${interactiveCalls.length} interactive calls found. Need at least 1 for analysis.`);
  }

  // 3. Fetch current prompt sections
  const { data: agent } = await supabase
    .from('agents')
    .select('id, current_prompt_id, retell_agent_id')
    .eq('id', agentId)
    .single();

  if (!agent) {
    throw new Error('Agent not found');
  }

  let promptSections: Record<string, string> = {};
  let promptVersionId: string | null = null;

  if (agent.current_prompt_id) {
    const { data: promptVersion } = await supabase
      .from('prompt_versions')
      .select('id, prompt_role, prompt_personality, prompt_call_flow, prompt_info_recap, prompt_functions, prompt_knowledge, compiled_prompt')
      .eq('id', agent.current_prompt_id)
      .single();

    if (promptVersion) {
      promptVersionId = promptVersion.id;
      promptSections = {
        role: promptVersion.prompt_role || '',
        personality: promptVersion.prompt_personality || '',
        call_flow: promptVersion.prompt_call_flow || '',
        info_recap: promptVersion.prompt_info_recap || '',
        functions: promptVersion.prompt_functions || '',
        knowledge_base: promptVersion.prompt_knowledge || '',
      };
    }
  }

  // 4. Fetch recently accepted suggestions for context
  const { data: recentSuggestions } = await supabase
    .from('ai_improvement_suggestions')
    .select('title, description, proposed_changes, created_at')
    .eq('agent_id', agentId)
    .eq('status', 'accepted')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // 5. Build batch analysis prompt and call Claude
  const batchPrompt = buildBatchAnalysisPrompt(interactiveCalls as Call[], promptSections, recentSuggestions || []);

  console.log(`[AI Manager] Calling Claude for batch analysis (${interactiveCalls.length} calls)...`);

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: batchPrompt
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const analysis = parseBatchAnalysis(content.text);

  console.log(`[AI Manager] Batch analysis complete: quality=${analysis.overall_quality_score}, issues=${analysis.top_issues.length}, strengths=${analysis.strengths.length}`);

  // 6. Store in ai_batch_analyses
  const { data: batchRecord, error: insertError } = await supabase
    .from('ai_batch_analyses')
    .insert({
      agent_id: agentId,
      call_ids: interactiveCalls.map(c => c.id),
      calls_analyzed: interactiveCalls.length,
      calls_skipped: skippedCount,
      overall_quality_score: analysis.overall_quality_score,
      strengths: analysis.strengths,
      top_issues: analysis.top_issues,
      calls_summary: analysis.calls_summary || null,
      prompt_version_id: promptVersionId,
      analysis_model: 'claude-sonnet-4-5-20250929',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('[AI Manager] Failed to store batch analysis:', insertError);
    throw new Error('Failed to store analysis results');
  }

  // 7. Return analysis — user selects which issues to fix via UI
  // No auto-generated suggestion; the user picks issues and triggers a rewrite

  return {
    id: batchRecord.id,
    overall_quality_score: analysis.overall_quality_score,
    strengths: analysis.strengths,
    top_issues: analysis.top_issues,
    calls_analyzed: interactiveCalls.length,
    calls_skipped: skippedCount,
    suggestion_id: null,
  };
}

// ─── Core: Section Rewrite ───────────────────────────────────────────────────

/**
 * Generate a complete section rewrite for the top issue.
 * Makes ONE Claude call that returns the full rewritten section.
 */
interface Issue {
  issue: string;
  severity: string;
  target_section: string;
  fix_guidance: string;
  evidence: string[];
}

/**
 * Generate a rewrite addressing multiple selected issues.
 * Called from the API when the user selects issues and clicks "Generate Fix".
 * Groups issues by target section and makes one Claude call per section.
 */
export async function generateRewriteForIssues(
  agentId: string,
  issues: Issue[],
  analysisId?: string
): Promise<string | null> {
  const supabase = createServiceClient();

  // Get current prompt sections
  const { data: agent } = await supabase
    .from('agents')
    .select('id, current_prompt_id, retell_agent_id')
    .eq('id', agentId)
    .single();

  if (!agent?.current_prompt_id) {
    throw new Error('Agent has no prompt configured');
  }

  const { data: promptVersion } = await supabase
    .from('prompt_versions')
    .select('id, prompt_role, prompt_personality, prompt_call_flow, prompt_info_recap, prompt_functions, prompt_knowledge')
    .eq('id', agent.current_prompt_id)
    .single();

  if (!promptVersion) {
    throw new Error('Prompt version not found');
  }

  const promptSections: Record<string, string> = {
    role: promptVersion.prompt_role || '',
    personality: promptVersion.prompt_personality || '',
    call_flow: promptVersion.prompt_call_flow || '',
    info_recap: promptVersion.prompt_info_recap || '',
    functions: promptVersion.prompt_functions || '',
    knowledge_base: promptVersion.prompt_knowledge || '',
  };

  // Filter out platform-level issues (target_section = "none")
  const fixableIssues = issues.filter(i => i.target_section && i.target_section !== 'none');
  if (fixableIssues.length === 0) {
    throw new Error('No fixable issues selected (all are platform-level)');
  }

  // Group issues by target section
  const issuesBySection: Record<string, Issue[]> = {};
  for (const issue of fixableIssues) {
    if (!issuesBySection[issue.target_section]) {
      issuesBySection[issue.target_section] = [];
    }
    issuesBySection[issue.target_section].push(issue);
  }

  // Generate rewrites — one Claude call per section
  const allChanges: Array<{ section: string; current_content: string; new_content: string }> = [];
  const allSections: string[] = [];
  const issueTitles: string[] = [];

  for (const [sectionKey, sectionIssues] of Object.entries(issuesBySection)) {
    const currentContent = promptSections[sectionKey];
    if (!currentContent || currentContent.trim().length === 0) {
      console.log(`[AI Manager] Section "${sectionKey}" is empty, skipping`);
      continue;
    }

    const rewritePrompt = buildSectionRewritePrompt(sectionKey, currentContent, sectionIssues, promptSections);

    console.log(`[AI Manager] Calling Claude for section rewrite (section: ${sectionKey}, issues: ${sectionIssues.length})...`);

    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 6000,
      messages: [{ role: 'user', content: rewritePrompt }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const newContent = parseRewrittenSection(content.text);
    if (!newContent || newContent.trim().length < 20) {
      console.error(`[AI Manager] Rewrite for "${sectionKey}" produced empty content, skipping`);
      continue;
    }

    allChanges.push({ section: sectionKey, current_content: currentContent, new_content: newContent });
    allSections.push(sectionKey);
    sectionIssues.forEach(i => issueTitles.push(i.issue));
  }

  if (allChanges.length === 0) {
    throw new Error('All rewrites failed to produce content');
  }

  // Build a combined title
  const title = allChanges.length === 1
    ? `Improve ${allSections[0].replace(/_/g, ' ')}: ${issueTitles[0]}`
    : `Fix ${issueTitles.length} issues across ${allSections.map(s => s.replace(/_/g, ' ')).join(', ')}`;

  const description = fixableIssues.map(i => `• ${i.issue}: ${i.fix_guidance}`).join('\n');

  // Get source call IDs from the analysis if available
  let sourceCallIds: string[] = [];
  if (analysisId) {
    const { data: analysis } = await supabase
      .from('ai_batch_analyses')
      .select('call_ids')
      .eq('id', analysisId)
      .single();
    sourceCallIds = analysis?.call_ids || [];
  }

  // Store as a single suggestion
  const { data: suggestion, error: insertError } = await supabase
    .from('ai_improvement_suggestions')
    .insert({
      agent_id: agentId,
      source_type: 'batch_analysis',
      source_call_ids: sourceCallIds,
      suggestion_type: 'prompt_change',
      title,
      description,
      proposed_changes: {
        sections: allSections,
        changes: allChanges,
      },
      confidence_score: 0.85,
      impact_estimate: fixableIssues.some(i => i.severity === 'high') ? 'high' : 'medium',
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('[AI Manager] Failed to store suggestion:', insertError);
    throw new Error('Failed to store improvement suggestion');
  }

  // Link to analysis if provided
  if (analysisId) {
    await supabase
      .from('ai_batch_analyses')
      .update({ suggestion_id: suggestion.id })
      .eq('id', analysisId);
  }

  console.log(`[AI Manager] Created suggestion ${suggestion.id} (${allChanges.length} sections, ${issueTitles.length} issues)`);
  return suggestion.id;
}

// ─── Auto-trigger helper ─────────────────────────────────────────────────────

/**
 * Trigger batch analysis asynchronously (for use from webhook).
 * Checks if enough calls have accumulated since the last analysis.
 */
export async function triggerBatchAnalysisIfNeeded(agentId: string): Promise<void> {
  const supabase = createServiceClient();

  // Get the last batch analysis date
  const { data: lastAnalysis } = await supabase
    .from('ai_batch_analyses')
    .select('created_at')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastAnalysisDate = lastAnalysis?.[0]?.created_at || new Date(0).toISOString();

  // Count completed calls since last analysis
  const { count } = await supabase
    .from('calls')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .eq('call_status', 'completed')
    .not('transcript', 'is', null)
    .gt('created_at', lastAnalysisDate);

  console.log(`[AI Manager] Auto-trigger check: ${count} calls since last analysis`);

  if (count !== null && count >= 10) {
    console.log(`[AI Manager] Auto-triggering batch analysis (${count} calls since last)`);
    try {
      await runBatchAnalysis(agentId, { callCount: 10, daysSince: 14 });
      console.log('[AI Manager] Auto-triggered batch analysis completed');
    } catch (error: any) {
      console.error('[AI Manager] Auto-triggered batch analysis failed:', error.message);
    }
  }
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

function buildBatchAnalysisPrompt(
  calls: Call[],
  promptSections: Record<string, string>,
  recentSuggestions: any[]
): string {
  // Build transcripts section
  const transcriptsText = calls.map((call, idx) => {
    // Truncate very long transcripts to keep within token limits
    const transcript = call.transcript.length > 3000
      ? call.transcript.substring(0, 3000) + '\n[...transcript truncated]'
      : call.transcript;
    return `--- CALL ${idx + 1} (${call.id.substring(0, 8)}) ---\n${transcript}`;
  }).join('\n\n');

  // Build prompt sections text
  const promptText = Object.entries(promptSections)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `[${k.toUpperCase()}]\n${v}`)
    .join('\n\n');

  // Build recent fixes context
  const recentFixesText = recentSuggestions.length > 0
    ? recentSuggestions.map(s => `- ${s.title}: ${s.description}`).join('\n')
    : 'None';

  return `You are an expert AI sales call quality analyst. Analyze these ${calls.length} voice AI agent calls and assess overall performance.

CURRENT AGENT PROMPT:
${promptText || '[No prompt configured]'}

RECENTLY ACCEPTED IMPROVEMENTS:
${recentFixesText}
NOTE: If you see an issue in the calls that was ALREADY addressed by a recent accepted improvement, that means the previous fix was too weak — the agent is still doing it wrong. In this case, DO flag the issue again, but your fix_guidance MUST describe a STRONGER structural fix. Do NOT repeat the same "add mandatory language" approach. Instead, describe how to restructure the section so the LLM cannot take a shortcut around the correct behavior.

CALL TRANSCRIPTS:
${transcriptsText}

ANALYSIS FRAMEWORK — Evaluate across these dimensions:

1. **Conversational Quality** — Natural flow, one question per turn, brief responses, varied acknowledgments
2. **Empathy** — Appropriate emotional awareness without overdoing it
3. **Professionalism** — Sounds like a real person, not a template
4. **Sales Efficiency** — Qualifies before collecting info, value bridges, scheduling persistence
5. **Goal Achievement** — Completed objectives, proper closing

ISSUE TYPES TO LOOK FOR:
- multiple_questions_per_turn, verbose_responses, robotic_language, missing_acknowledgment
- no_value_bridge, contact_before_qualify, scheduling_pressure, name_overuse
- interrogation_feel, no_closing, excessive_empathy, missing_info_collection
- language_not_supported (customer spoke non-English)

Return ONLY valid JSON with this structure:
{
  "overall_quality_score": 0.72,
  "strengths": [
    { "label": "Natural tone", "detail": "Agent uses contractions and natural language consistently" }
  ],
  "top_issues": [
    {
      "issue": "Multiple questions per turn",
      "severity": "high",
      "target_section": "call_flow",
      "fix_guidance": "The agent frequently asks 2-3 questions in a single turn, overwhelming callers. The call_flow section should emphasize one question at a time with brief acknowledgments between questions.",
      "evidence": ["Call 1 turn 5: asked name, email, and reason in one turn", "Call 3 turn 8: asked about budget and timeline together"]
    }
  ],
  "calls_summary": {
    "total_analyzed": ${calls.length},
    "common_topics": ["dental inquiry", "pricing questions"],
    "avg_user_turns": 8
  }
}

RULES:
- overall_quality_score: 0.0-1.0 based on the framework
- strengths: 1-4 things the agent does well. Be specific.
- top_issues: Rank by impact. Maximum 3 issues. Each MUST include:
  - target_section: one of "role", "personality", "call_flow", "info_recap", "functions", "knowledge_base"
  - fix_guidance: specific, STRUCTURAL description of how to fix the issue. Do NOT say "add stronger language" or "emphasize that X is mandatory" — those are weak fixes. Instead, describe HOW to restructure the section so the correct behavior is the only possible path. Example: "Move the recap dialogue to be the ONLY path before end_call — remove any shortcut that lets the agent skip from booking confirmation directly to goodbye"
  - evidence: 2-3 specific examples from the transcripts with turn references
- Do NOT flag issues that were already fixed in recent accepted improvements
- If the agent is performing well (score > 0.85), it's OK to have 0 issues
- Be honest and specific — vague issues like "could be better" are not helpful
- NEVER suggest prompt-level fixes for platform-level issues. These are controlled by Retell's speech settings, NOT the prompt: audio interruptions/overlaps, agent talking over the caller, latency/response delays, audio quality, background noise, turn-taking timing. If you observe these, note them in strengths/issues for awareness but set target_section to "none" so no rewrite is attempted.`;
}

function buildSectionRewritePrompt(
  sectionKey: string,
  currentContent: string,
  issues: Issue[],
  allSections: Record<string, string>
): string {
  // Give full context of other sections so Claude understands the whole prompt
  const otherSectionsContext = Object.entries(allSections)
    .filter(([k]) => k !== sectionKey)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `[${k.toUpperCase()}]\n${v}`)
    .join('\n\n');

  // Format issues — could be 1 or multiple
  const issuesText = issues.map((issue, idx) => {
    const num = issues.length > 1 ? `Issue ${idx + 1}: ` : '';
    return `${num}${issue.issue}
  Severity: ${issue.severity}
  What went wrong: ${issue.fix_guidance}
  Evidence: ${issue.evidence.join(' | ')}`;
  }).join('\n\n');

  return `You are a senior voice AI prompt engineer reviewing a production phone agent. You've deployed 500+ agents and know exactly why prompts fail — the LLM takes shortcuts, ignores "mandatory" instructions, and skips sections it finds unnecessary. You fix prompts by RESTRUCTURING them so the correct behavior is the only possible path.

${issues.length > 1 ? `ISSUES FOUND IN LIVE CALLS (fix ALL of these in one rewrite):` : `ISSUE FOUND IN LIVE CALLS:`}
${issuesText}

FULL AGENT PROMPT FOR CONTEXT:
${otherSectionsContext || 'No other sections'}

SECTION TO REWRITE — "${sectionKey.toUpperCase()}":
${currentContent}

YOUR JOB:
Rewrite the "${sectionKey}" section above so ${issues.length > 1 ? 'ALL of these issues are' : 'the issue is'} ACTUALLY FIXED on the next call. You are doing what a human prompt engineer would do — restructure, delete, rewrite, add — whatever it takes.

HOW TO THINK ABOUT FIXES:
- The current prompt already tells the agent to do the right thing, but the agent is ignoring it. Adding another line saying "this is mandatory" will NOT work. The LLM already ignores the existing instruction — adding a stronger adjective won't change that.
- Instead, think about WHY the LLM is skipping it. Usually there's a shorter/easier path it takes. Your job is to ELIMINATE the shortcut path.
- Delete instruction paragraphs that the LLM ignores. Replace them with actual dialogue and flow that the LLM WILL follow.
- LLMs follow dialogue examples much more reliably than instruction paragraphs. If you want the agent to do a recap, don't write "You must do a recap." Instead, write the actual recap dialogue as the next thing to say after booking, with no other path available.
- Remove redundant or contradictory instructions. If 3 lines say the same thing, keep 1.

CONSTRAINTS:
- Output the COMPLETE rewritten section, not a diff
- Lines UNRELATED to the issues: keep them EXACTLY as-is (same words, same punctuation)
- Lines RELATED to the issues: restructure as aggressively as needed
- This is a VOICE AI prompt — everything is spoken aloud by TTS. Never include system tokens like "NO_RESPONSE_NEEDED", "[pause]", etc. Describe behaviors in natural language.
- Never include instructions about audio-level behaviors (interruption handling, response timing, turn-detection) — those are Retell platform settings, not prompt-controllable.
- Do NOT add meta-labels like "IMPORTANT:", "CRITICAL:", "NOTE:", "MANDATORY:" — just write the actual content.
- Preserve all SSML tags (<break time='.2s'/> etc.)

Return ONLY the rewritten section. No JSON, no markdown code blocks, no explanation.`;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

interface ParsedBatchAnalysis {
  overall_quality_score: number;
  strengths: Array<{ label: string; detail: string }>;
  top_issues: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    target_section: string;
    fix_guidance: string;
    evidence: string[];
  }>;
  calls_summary: any;
}

function parseBatchAnalysis(response: string): ParsedBatchAnalysis {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      overall_quality_score: Math.min(Math.max(parsed.overall_quality_score || 0, 0), 1),
      strengths: (parsed.strengths || []).map((s: any) => ({
        label: s.label || 'Unnamed',
        detail: s.detail || '',
      })),
      top_issues: (parsed.top_issues || []).slice(0, 3).map((i: any) => ({
        issue: i.issue || 'Unnamed issue',
        severity: (['low', 'medium', 'high'].includes(i.severity) ? i.severity : 'medium') as 'low' | 'medium' | 'high',
        target_section: i.target_section || 'call_flow',
        fix_guidance: i.fix_guidance || '',
        evidence: Array.isArray(i.evidence) ? i.evidence : [],
      })),
      calls_summary: parsed.calls_summary || null,
    };
  } catch (error: any) {
    console.error('[AI Manager] Failed to parse batch analysis:', error.message);
    console.error('[AI Manager] Response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse analysis response: ${error.message}`);
  }
}

function parseRewrittenSection(response: string): string {
  // The rewrite prompt asks for raw content, but Claude sometimes wraps in markdown
  let cleaned = response.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Remove any leading/trailing quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned;
}
