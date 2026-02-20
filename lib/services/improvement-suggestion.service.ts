import { createServiceClient } from '@/lib/supabase/client';

/**
 * Applies an accepted suggestion to create a new prompt version.
 * V2: Supports both REPLACE (new_content) and legacy APPEND (modification) formats.
 * Also syncs the updated prompt to Retell AI.
 */
export async function applySuggestion(
  suggestionId: string,
  userId: string | null
): Promise<string> {
  const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';
  console.log('[Apply Suggestion] Starting - suggestionId:', suggestionId, 'userId:', effectiveUserId);

  const supabase = createServiceClient();

  // Get suggestion
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
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, current_prompt_id, retell_agent_id')
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

  // Get current prompt version
  const { data: currentVersion, error: versionError } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('id', agent.current_prompt_id)
    .single();

  if (versionError || !currentVersion) {
    console.error('[Apply Suggestion] Current prompt version not found:', versionError);
    throw new Error('Current prompt version not found');
  }

  console.log('[Apply Suggestion] Current version:', currentVersion.version_number);

  // Apply changes to create new prompt
  const proposedChanges = suggestion.proposed_changes as {
    sections: string[];
    changes: Array<{
      section: string;
      modification?: string;    // Legacy: append format
      current_content?: string;  // V2: for diff display
      new_content?: string;      // V2: full replacement
    }>;
  };

  const newPromptData: Record<string, string> = {
    prompt_role: currentVersion.prompt_role || '',
    prompt_personality: currentVersion.prompt_personality || '',
    prompt_call_flow: currentVersion.prompt_call_flow || '',
    prompt_info_recap: currentVersion.prompt_info_recap || '',
    prompt_functions: currentVersion.prompt_functions || '',
    prompt_knowledge: currentVersion.prompt_knowledge || '',
  };

  // Apply each change
  for (const change of proposedChanges.changes) {
    const sectionKey = `prompt_${change.section}`;

    if (newPromptData[sectionKey] !== undefined) {
      if (change.new_content) {
        // V2: Full section replacement
        console.log(`[Apply Suggestion] REPLACING section "${change.section}" (${newPromptData[sectionKey].length} chars -> ${change.new_content.length} chars)`);
        newPromptData[sectionKey] = change.new_content;
      } else if (change.modification) {
        // LEGACY: Append for old pending suggestions
        let cleanedModification = change.modification
          .replace(/^(Add to .*?:|Insert:|Change to:|Append:|Update to:)\s*/gi, '')
          .replace(/^(Add:|Insert:)\s*/gi, '')
          .trim();

        console.log(`[Apply Suggestion] APPENDING to section "${change.section}" (legacy): ${cleanedModification.substring(0, 100)}`);
        const currentContent = newPromptData[sectionKey] || '';
        newPromptData[sectionKey] = currentContent + '\n\n' + cleanedModification;
      }
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
      created_by: null,
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

  console.log(`[Apply Suggestion] Created prompt version ${nextVersion} for agent ${suggestion.agent_id}`);

  // ─── Sync to Retell AI ────────────────────────────────────────────────────
  // CRITICAL: Without this, accepting a suggestion updates the DB but the
  // live Retell agent keeps running the old prompt.
  if (agent.retell_agent_id) {
    await syncPromptToRetell(agent.retell_agent_id, compiledPrompt);
  } else {
    console.log('[Apply Suggestion] Agent has no retell_agent_id, skipping Retell sync');
  }

  // ─── Language-specific Retell updates ──────────────────────────────────────
  const isLanguageSuggestion = suggestion.title?.toLowerCase().includes('language') ||
                                suggestion.title?.toLowerCase().includes('multilingual') ||
                                suggestion.title?.toLowerCase().includes('spanish') ||
                                suggestion.title?.toLowerCase().includes('french') ||
                                suggestion.description?.toLowerCase().includes('non-english');

  if (isLanguageSuggestion && agent.retell_agent_id) {
    console.log('[Apply Suggestion] Language suggestion detected - updating Retell agent to multilingual mode');
    try {
      const updateResponse = await fetch(`https://api.retellai.com/update-agent`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: agent.retell_agent_id,
          language: 'multi'
        })
      });

      if (updateResponse.ok) {
        console.log('[Apply Suggestion] Retell agent updated to multilingual mode');
      } else {
        const errorData = await updateResponse.text();
        console.error('[Apply Suggestion] Failed to update Retell language:', errorData);
      }
    } catch (retellError) {
      console.error('[Apply Suggestion] Error updating Retell language:', retellError);
    }
  }

  return newVersion.id;
}

/**
 * Sync the compiled prompt to the live Retell agent.
 * This ensures the agent actually uses the updated prompt.
 */
async function syncPromptToRetell(retellAgentId: string, compiledPrompt: string): Promise<void> {
  const retellApiKey = process.env.RETELL_API_KEY;
  if (!retellApiKey) {
    console.error('[Retell Sync] RETELL_API_KEY not set, skipping sync');
    return;
  }

  try {
    // First, get the agent to find its LLM ID
    const agentResponse = await fetch(`https://api.retellai.com/get-agent/${retellAgentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
      }
    });

    if (!agentResponse.ok) {
      console.error('[Retell Sync] Failed to get agent:', await agentResponse.text());
      return;
    }

    const agentData = await agentResponse.json();
    const llmId = agentData.response_engine?.llm_id;

    if (!llmId) {
      console.error('[Retell Sync] No LLM ID found for agent');
      return;
    }

    // Update the LLM's general_prompt
    const updateResponse = await fetch(`https://api.retellai.com/update-retell-llm/${llmId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        general_prompt: compiledPrompt,
      })
    });

    if (updateResponse.ok) {
      console.log(`[Retell Sync] Successfully synced prompt to Retell LLM ${llmId}`);
    } else {
      const errorData = await updateResponse.text();
      console.error('[Retell Sync] Failed to update LLM:', errorData);
    }
  } catch (error) {
    console.error('[Retell Sync] Error syncing to Retell:', error);
    // Don't throw — the prompt version is already saved in the DB
  }
}
