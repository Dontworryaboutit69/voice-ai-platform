import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  return new Anthropic({ apiKey });
}

interface SuggestionData {
  title: string;
  description: string;
  changes: Array<{
    section: string;
    modification: string;
  }>;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Generates improvement suggestion based on pattern analysis
 */
export async function generateImprovementSuggestion(
  agentId: string,
  sourceCallIds: string[],
  analysisData: { pattern: any }
): Promise<void> {
  const supabase = createServiceClient();

  // Get agent and current prompt
  const { data: agent } = await supabase
    .from('agents')
    .select('id, current_prompt_id')
    .eq('id', agentId)
    .single();

  if (!agent) {
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

  // Get transcripts for source calls (limit to 3 examples)
  const { data: calls } = await supabase
    .from('calls')
    .select('id, transcript')
    .in('id', sourceCallIds.slice(0, 3));

  const callTranscripts = calls?.map(c => c.transcript).join('\n\n---\n\n') || '';

  // Use Claude API to generate specific prompt improvements
  console.log(`[Improvement Suggestion] Generating suggestion for pattern: ${analysisData.pattern.pattern}`);

  const suggestionPrompt = buildSuggestionPrompt(
    currentPrompt,
    callTranscripts,
    analysisData.pattern
  );

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: suggestionPrompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const suggestion = parseSuggestion(content.text);

    // Store suggestion - CRITICAL: Always set status to 'pending'
    const { error: insertError } = await supabase
      .from('ai_improvement_suggestions')
      .insert({
        agent_id: agentId,
        source_type: sourceCallIds.length > 1 ? 'pattern_analysis' : 'batch_evaluation',
        source_call_ids: sourceCallIds,
        suggestion_type: 'prompt_change',
        title: suggestion.title,
        description: suggestion.description,
        proposed_changes: {
          sections: suggestion.changes.map(c => c.section),
          changes: suggestion.changes
        },
        confidence_score: suggestion.confidence,
        impact_estimate: suggestion.impact,
        status: 'pending' // Human approval always required
      });

    if (insertError) {
      console.error('[Improvement Suggestion] Failed to store suggestion:', insertError);
      throw insertError;
    }

    console.log(`[Improvement Suggestion] Created suggestion: ${suggestion.title}`);
  } catch (error: any) {
    console.error('[Improvement Suggestion] Claude API error:', error);
    throw error;
  }
}

/**
 * Builds the suggestion prompt for Claude API
 */
function buildSuggestionPrompt(
  currentPrompt: string,
  callTranscripts: string,
  pattern: any
): string {
  return `You are an AI prompt optimization expert. Analyze these calls and suggest specific prompt improvements.

Current Agent Prompt:
${currentPrompt || '[No prompt configured]'}

Issue Detected: ${pattern.pattern}
Occurred in: ${pattern.occurrence_count} calls
Severity: ${pattern.severity}
Frequency: ${(pattern.frequency * 100).toFixed(1)}%

Example Call Transcripts (showing the issue):
${callTranscripts}

Your task:
1. Carefully review the CURRENT PROMPT to understand existing guidelines
2. Analyze if the issue is actually a problem or if it's acceptable behavior
3. Consider nuance: Some patterns may be acceptable in certain contexts (e.g., compound questions that naturally go together like "What's your address and when works best?")
4. Only suggest changes if there's a genuine improvement opportunity
5. Propose specific modifications that enhance the prompt without being overly restrictive
6. Ensure changes don't break other functionality or remove helpful flexibility

Important Context:
- "agent_asks_multiple_questions" is NOT always bad - compound questions are often natural and efficient
- Look for patterns that truly hurt conversation quality, not just style preferences
- Be thoughtful about whether the pattern actually needs fixing
- SPECIAL: If the issue is "language_not_supported" (customer speaking non-English), create a suggestion to add multilingual support with clear instructions about the detected language(s)

Return ONLY valid JSON with this exact structure:
{
  "title": "Clear, concise title (e.g., 'Reduce Question Overload in Single Turn')",
  "description": "Detailed explanation of the ACTUAL issue and why this change helps. Focus on real problems, not just deviations from arbitrary rules. (2-3 sentences)",
  "changes": [
    {
      "section": "call_flow",
      "modification": "Ask one question at a time and wait for the customer's response before moving to the next question. This creates a natural conversation flow and prevents overwhelming the customer."
    }
  ],
  "confidence": 0.88,
  "impact": "high"
}

CRITICAL: The "modification" field should contain ONLY the actual prompt instructions that will be appended. Do NOT include meta-text like "Add this:", "Insert:", or "Change to:". Just write the raw prompt text that should be added.

Important:
- title should be under 60 characters and describe the real issue
- changes array can have multiple items if multiple sections need updates
- section should be one of: role, personality, call_flow, info_recap, functions, knowledge_base
- modification should contain ONLY the actual prompt text to append - NO meta-instructions like "Add to...", "Insert...", etc.
- modification text should flow naturally when appended to the existing section content
- confidence should reflect how certain you are this is a real problem (0.0 to 1.0)
- impact should be "low", "medium", or "high" based on actual conversation quality impact
- If the pattern is actually acceptable behavior, set confidence low and explain why in description

SPECIAL CASE - Language Detection:
If the issue is "language_not_supported", create a suggestion like this:
{
  "title": "Add Spanish Language Support",
  "description": "Customer spoke in Spanish but agent only responds in English. This creates a poor experience for non-English speakers. Add multilingual capability to serve Spanish-speaking customers.",
  "changes": [
    {
      "section": "personality",
      "modification": "Add: You are fluent in both English and Spanish. Detect the customer's language preference and respond in their language throughout the conversation."
    },
    {
      "section": "call_flow",
      "modification": "Add: If customer speaks Spanish, continue entire conversation in Spanish. Mirror the customer's language choice."
    }
  ],
  "confidence": 0.95,
  "impact": "high"
}

Note: When accepted, this will automatically enable multilingual mode in Retell settings.`;
}

/**
 * Parses Claude's suggestion response
 */
function parseSuggestion(response: string): SuggestionData {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      title: parsed.title || 'Untitled Suggestion',
      description: parsed.description || '',
      changes: parsed.changes || [],
      confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1), // Clamp to 0-1
      impact: parsed.impact || 'medium',
    };
  } catch (error) {
    console.error('[Improvement Suggestion] Failed to parse suggestion:', error);
    console.error('[Improvement Suggestion] Response was:', response);
    throw new Error('Failed to parse suggestion response');
  }
}

/**
 * Applies an accepted suggestion to create a new prompt version
 */
export async function applySuggestion(
  suggestionId: string,
  userId: string | null
): Promise<string> {
  // Use system user ID if no user provided (for when auth isn't set up)
  const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';
  console.log('[Apply Suggestion] Starting - suggestionId:', suggestionId, 'userId:', effectiveUserId);

  const supabase = createServiceClient();

  // Get suggestion
  console.log('[Apply Suggestion] Fetching suggestion from database...');
  const { data: suggestion, error: suggestionError } = await supabase
    .from('ai_improvement_suggestions')
    .select('*')
    .eq('id', suggestionId)
    .single();

  if (suggestionError || !suggestion) {
    console.error('[Apply Suggestion] Suggestion not found:', suggestionError);
    throw new Error('Suggestion not found');
  }
  console.log('[Apply Suggestion] Found suggestion:', suggestion.title);

  // Get agent and current prompt
  console.log('[Apply Suggestion] Fetching agent:', suggestion.agent_id);
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, current_prompt_id')
    .eq('id', suggestion.agent_id)
    .single();

  if (agentError || !agent) {
    console.error('[Apply Suggestion] Agent not found:', agentError);
    throw new Error('Agent not found');
  }

  if (!agent.current_prompt_id) {
    console.error('[Apply Suggestion] Agent has no current_prompt_id');
    throw new Error('Agent has no current prompt');
  }

  console.log('[Apply Suggestion] Agent found, current_prompt_id:', agent.current_prompt_id);

  // Get current prompt version
  console.log('[Apply Suggestion] Fetching current prompt version...');
  const { data: currentVersion, error: versionError } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('id', agent.current_prompt_id)
    .single();

  if (versionError || !currentVersion) {
    console.error('[Apply Suggestion] Current prompt version not found:', versionError);
    throw new Error('Current prompt version not found');
  }

  console.log('[Apply Suggestion] Current version found, version:', currentVersion.version_number);

  // Apply changes to create new prompt
  const proposedChanges = suggestion.proposed_changes as {
    sections: string[];
    changes: Array<{ section: string; modification: string }>;
  };

  const newPromptData: any = {
    prompt_role: currentVersion.prompt_role,
    prompt_personality: currentVersion.prompt_personality,
    prompt_call_flow: currentVersion.prompt_call_flow,
    prompt_info_recap: currentVersion.prompt_info_recap,
    prompt_functions: currentVersion.prompt_functions,
    prompt_knowledge: currentVersion.prompt_knowledge,
  };

  // Apply each change
  for (const change of proposedChanges.changes) {
    const sectionKey = `prompt_${change.section}` as keyof typeof newPromptData;

    if (newPromptData[sectionKey] !== undefined) {
      // Clean the modification text: remove meta-instructions that shouldn't be in the final prompt
      let cleanedModification = change.modification
        .replace(/^(Add to .*?:|Insert:|Change to:|Append:|Update to:)\s*/gi, '')
        .replace(/^(Add:|Insert:)\s*/gi, '')
        .trim();

      // Append modification to existing content
      const currentContent = newPromptData[sectionKey] || '';
      newPromptData[sectionKey] = currentContent + '\n\n' + cleanedModification;

      console.log(`[Apply Suggestion] Applied to ${change.section}:`, cleanedModification.substring(0, 100));
    }
  }

  // Compile new prompt
  const compiledPrompt = [
    newPromptData.prompt_role,
    newPromptData.prompt_personality,
    newPromptData.prompt_call_flow,
    newPromptData.prompt_info_recap,
    newPromptData.prompt_functions,
    newPromptData.prompt_knowledge,
  ].filter(Boolean).join('\n\n');

  // Get next version number
  const { data: versions } = await supabase
    .from('prompt_versions')
    .select('version_number')
    .eq('agent_id', suggestion.agent_id)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (versions?.[0]?.version_number || 0) + 1;

  // Create new prompt version
  // Note: created_by is set to NULL for system-generated improvements since the system user
  // doesn't exist in auth.users table. This is acceptable for auto-improvements.
  const { data: newVersion, error: createVersionError } = await supabase
    .from('prompt_versions')
    .insert({
      agent_id: suggestion.agent_id,
      version_number: nextVersion,
      prompt_role: newPromptData.prompt_role,
      prompt_personality: newPromptData.prompt_personality,
      prompt_call_flow: newPromptData.prompt_call_flow,
      prompt_info_recap: newPromptData.prompt_info_recap,
      prompt_functions: newPromptData.prompt_functions,
      prompt_knowledge: newPromptData.prompt_knowledge,
      compiled_prompt: compiledPrompt,
      generation_method: 'auto_improved',
      parent_version_id: agent.current_prompt_id,
      change_summary: suggestion.title,
      created_by: null, // NULL for system-generated improvements
    })
    .select('id')
    .single();

  if (createVersionError || !newVersion) {
    console.error('[Apply Suggestion] Failed to create new version:', createVersionError);
    throw new Error('Failed to create new prompt version');
  }

  // Update agent's current prompt
  await supabase
    .from('agents')
    .update({ current_prompt_id: newVersion.id })
    .eq('id', suggestion.agent_id);

  // Update suggestion status
  await supabase
    .from('ai_improvement_suggestions')
    .update({
      status: 'accepted',
      reviewed_at: new Date().toISOString(),
      reviewed_by: effectiveUserId,
      applied_to_version_id: newVersion.id,
    })
    .eq('id', suggestionId);

  // SPECIAL HANDLING: If this is a language-related suggestion, update Retell agent to multilingual mode
  const isLanguageSuggestion = suggestion.title?.toLowerCase().includes('language') ||
                                suggestion.title?.toLowerCase().includes('multilingual') ||
                                suggestion.title?.toLowerCase().includes('spanish') ||
                                suggestion.title?.toLowerCase().includes('french') ||
                                suggestion.description?.toLowerCase().includes('non-english');

  if (isLanguageSuggestion) {
    console.log('[Apply Suggestion] Language suggestion detected - updating Retell agent to multilingual mode');

    // Get full agent data including retell_agent_id
    const { data: fullAgent } = await supabase
      .from('agents')
      .select('retell_agent_id')
      .eq('id', suggestion.agent_id)
      .single();

    if (fullAgent?.retell_agent_id) {
      try {
        const updateResponse = await fetch(`https://api.retellai.com/update-agent`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: fullAgent.retell_agent_id,
            language: 'multi' // Enable multilingual support
          })
        });

        if (updateResponse.ok) {
          console.log('[Apply Suggestion] ✅ Retell agent updated to multilingual mode');
        } else {
          const errorData = await updateResponse.text();
          console.error('[Apply Suggestion] Failed to update Retell agent:', errorData);
        }
      } catch (retellError) {
        console.error('[Apply Suggestion] Error updating Retell agent:', retellError);
        // Don't fail the whole operation if Retell update fails
      }
    } else {
      console.log('[Apply Suggestion] Agent has no retell_agent_id, skipping Retell update');
    }
  }

  console.log(`[Apply Suggestion] Created new prompt version ${nextVersion} for agent ${suggestion.agent_id}`);

  return newVersion.id;
}
