import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

// API key - hardcoded temporarily to fix Turbopack env var issue
const ANTHROPIC_API_KEY = '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';

/**
 * Parses a compiled prompt into individual sections
 * This ensures sections are extracted properly, not by arbitrary character positions
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
    const body = await request.json();
    const { feedback } = body;

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get current agent and prompt
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*, current_prompt:prompt_versions!current_prompt_id(*)')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const currentPrompt = agent.current_prompt;

    if (!currentPrompt) {
      return NextResponse.json(
        { success: false, error: 'No current prompt found' },
        { status: 404 }
      );
    }

    // Get framework instructions
    const { data: framework, error: frameworkError } = await supabase
      .from('framework_instructions')
      .select('instructions')
      .eq('is_active', true)
      .single();

    if (frameworkError || !framework) {
      return NextResponse.json(
        { success: false, error: 'Framework not found' },
        { status: 500 }
      );
    }

    // Use Claude to analyze feedback and improve prompt
    console.log('Processing feedback with Claude...');
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const improvementPrompt = `You are improving a voice AI prompt based on user feedback.

CURRENT PROMPT:
${currentPrompt.compiled_prompt}

USER FEEDBACK:
${feedback}

FRAMEWORK REQUIREMENTS:
${framework.instructions}

Please analyze the feedback and create an IMPROVED version of the prompt that:
1. Addresses the specific feedback provided
2. Maintains all framework requirements (SSML breaks, WAIT patterns, natural language, etc.)
3. Keeps the same 6-section structure
4. Stays under the token limit (2,600 words for outbound agents)
5. Preserves what's working well

Return ONLY the improved prompt text, no explanations or meta-commentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: improvementPrompt
      }]
    });

    const improvedPrompt = message.content[0].type === 'text' ? message.content[0].text : '';

    if (!improvedPrompt) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate improvement' },
        { status: 500 }
      );
    }

    // Calculate new version number
    const newVersionNumber = currentPrompt.version_number + 1;

    // Parse sections properly using section markers
    const sections = parsePromptSections(improvedPrompt);

    // Create new prompt version
    const { data: newVersion, error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agentId,
        version_number: newVersionNumber,
        prompt_role: sections.role,
        prompt_personality: sections.personality,
        prompt_call_flow: sections.call_flow,
        prompt_info_recap: sections.info_recap,
        prompt_functions: sections.functions,
        prompt_knowledge: sections.knowledge,
        compiled_prompt: improvedPrompt,
        generation_method: 'auto_improved',
        parent_version_id: currentPrompt.id,
        change_summary: `User feedback: ${feedback.substring(0, 100)}...`,
        token_count: improvedPrompt.split(' ').length
      })
      .select()
      .single();

    if (versionError || !newVersion) {
      console.error('Version creation error:', versionError);
      return NextResponse.json(
        { success: false, error: 'Failed to save improved prompt' },
        { status: 500 }
      );
    }

    // Update agent's current prompt
    await supabase
      .from('agents')
      .update({ current_prompt_id: newVersion.id })
      .eq('id', agentId);

    return NextResponse.json({
      success: true,
      newVersionId: newVersion.id,
      versionNumber: newVersionNumber,
      feedback: feedback,
      changeSummary: `Improved based on: ${feedback.substring(0, 50)}...`
    });

  } catch (error) {
    console.error('Error improving prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
