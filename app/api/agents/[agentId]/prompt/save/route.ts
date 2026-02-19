import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { getAppUrl } from '@/lib/retell-tools';

/**
 * Parses a compiled prompt into individual sections
 * This ensures the AI Manager can work with clean, separated sections
 */
function parsePromptSections(compiledPrompt: string): {
  role: string;
  personality: string;
  call_flow: string;
  info_recap: string;
  functions: any;
  knowledge: string;
} {
  // Section markers
  const roleMarker = '## 1. Role & Objective';
  const personalityMarker = '## 2. Personality';
  const callFlowMarker = '## 3. Call Flow';
  const infoRecapMarker = '## 4. Information Recap';
  const functionsMarker = '## 5. Function Reference';
  const knowledgeMarker = '## 6. Knowledge Base Setup';

  // Find section positions
  const roleStart = compiledPrompt.indexOf(roleMarker);
  const personalityStart = compiledPrompt.indexOf(personalityMarker);
  const callFlowStart = compiledPrompt.indexOf(callFlowMarker);
  const infoRecapStart = compiledPrompt.indexOf(infoRecapMarker);
  const functionsStart = compiledPrompt.indexOf(functionsMarker);
  const knowledgeStart = compiledPrompt.indexOf(knowledgeMarker);

  // Extract sections (everything between markers)
  const extractSection = (startPos: number, endPos: number): string => {
    if (startPos === -1) return '';
    const end = endPos !== -1 ? endPos : compiledPrompt.length;
    return compiledPrompt.substring(startPos, end).trim();
  };

  const role = extractSection(roleStart, personalityStart);
  const personality = extractSection(personalityStart, callFlowStart);
  const call_flow = extractSection(callFlowStart, infoRecapStart);
  const info_recap = extractSection(infoRecapStart, functionsStart);
  const functions_text = extractSection(functionsStart, knowledgeStart);
  const knowledge = extractSection(knowledgeStart, -1);

  return {
    role,
    personality,
    call_flow,
    info_recap,
    functions: functions_text,
    knowledge
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { compiledPrompt, changeSummary } = await request.json();

    if (!compiledPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt content is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get current prompt version
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        current_prompt:prompt_versions!current_prompt_id(*)
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent || !agent.current_prompt) {
      return NextResponse.json(
        { success: false, error: 'Agent or prompt not found' },
        { status: 404 }
      );
    }

    const currentPrompt = agent.current_prompt;
    const newVersionNumber = currentPrompt.version_number + 1;

    // Parse the compiled prompt into sections
    // This ensures AI Manager can work with individual sections later
    const sections = parsePromptSections(compiledPrompt);

    // Create new prompt version with ALL fields properly populated
    const { data: newVersion, error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agentId,
        version_number: newVersionNumber,
        compiled_prompt: compiledPrompt,
        prompt_role: sections.role,
        prompt_personality: sections.personality,
        prompt_call_flow: sections.call_flow,
        prompt_info_recap: sections.info_recap,
        prompt_functions: sections.functions,
        prompt_knowledge: sections.knowledge,
        generation_method: 'user_edited',
        parent_version_id: currentPrompt.id,
        change_summary: changeSummary || 'Manual edit',
        token_count: compiledPrompt.split(' ').length
      })
      .select()
      .single();

    if (versionError) {
      console.error('Error creating new version:', versionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create new prompt version' },
        { status: 500 }
      );
    }

    // Update agent's current prompt
    await supabase
      .from('agents')
      .update({
        current_prompt_id: newVersion.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    // Update Retell agent if connected
    if (agent.retell_agent_id) {
      try {
        // Configure webhook URL to ensure calls are tracked
        const appUrl = getAppUrl();

        await fetch(`https://api.retellai.com/update-agent`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: agent.retell_agent_id,
            general_prompt: compiledPrompt,
            webhook_url: `${appUrl}/api/webhooks/retell/call-events`
          })
        });
      } catch (retellError) {
        console.error('Error updating Retell agent:', retellError);
        // Don't fail the whole request if Retell update fails
      }
    }

    return NextResponse.json({
      success: true,
      versionNumber: newVersionNumber,
      promptVersion: newVersion
    });

  } catch (error: any) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save prompt' },
      { status: 500 }
    );
  }
}
