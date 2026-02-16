import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  parsePromptSections,
  editPromptWithFeedback,
  compileSections
} from '@/lib/services/prompt-editor.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { feedback } = await request.json();

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Feedback is required'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get current agent and prompt
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*, current_prompt:prompt_versions!current_prompt_id(*)')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found'
      }, { status: 404 });
    }

    const currentPrompt = agent.current_prompt;

    if (!currentPrompt) {
      return NextResponse.json({
        success: false,
        error: 'No current prompt found'
      }, { status: 404 });
    }

    // Get framework instructions
    const { data: framework } = await supabase
      .from('framework_instructions')
      .select('instructions')
      .eq('is_active', true)
      .single();

    const frameworkInstructions = framework?.instructions || '';

    // Parse current prompt into sections
    const currentSections = parsePromptSections(currentPrompt.compiled_prompt);

    // Edit prompt intelligently using AI
    console.log('[Chat Edit] Processing feedback:', feedback);
    const editedSections = await editPromptWithFeedback(
      currentSections,
      feedback,
      frameworkInstructions
    );

    // Compile sections into final prompt
    const compiledPrompt = compileSections(editedSections);

    // Calculate next version number
    const { data: versions } = await supabase
      .from('prompt_versions')
      .select('version_number')
      .eq('agent_id', agentId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    // Create new prompt version
    const { data: newVersion, error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agentId,
        version_number: nextVersion,
        compiled_prompt: compiledPrompt,
        prompt_role: editedSections.role,
        prompt_personality: editedSections.personality,
        prompt_call_flow: editedSections.call_flow,
        prompt_info_recap: editedSections.info_recap,
        prompt_functions: editedSections.functions,
        prompt_knowledge: editedSections.knowledge,
        generation_method: 'chat_edited',
        parent_version_id: currentPrompt.id,
        change_summary: `Chat edit: ${feedback.substring(0, 100)}`,
        token_count: compiledPrompt.split(' ').length,
        created_by: null
      })
      .select()
      .single();

    if (versionError || !newVersion) {
      console.error('[Chat Edit] Error creating version:', versionError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create new version'
      }, { status: 500 });
    }

    // Update agent's current prompt
    const { error: updateError } = await supabase
      .from('agents')
      .update({ current_prompt_id: newVersion.id })
      .eq('id', agentId);

    if (updateError) {
      console.error('[Chat Edit] Error updating agent:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update agent'
      }, { status: 500 });
    }

    console.log('[Chat Edit] Successfully created version', nextVersion);

    return NextResponse.json({
      success: true,
      newVersion
    });

  } catch (error: any) {
    console.error('[Chat Edit] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
