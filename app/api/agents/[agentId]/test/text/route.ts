import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

const ANTHROPIC_API_KEY = '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';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { message, conversationHistory } = await request.json();
    const { agentId } = await params;

    // Get agent and current prompt from database
    const supabase = createServiceClient();
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        prompt_versions!current_prompt_id (*)
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const promptVersion = agent.prompt_versions;
    if (!promptVersion) {
      return NextResponse.json(
        { success: false, error: 'No prompt version found' },
        { status: 404 }
      );
    }

    // Build conversation messages for Claude
    const messages: any[] = [];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'agent' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call Claude API with the agent's prompt as system message
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: promptVersion.compiled_prompt,
      messages: messages
    });

    const agentResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, I had trouble generating a response.';

    return NextResponse.json({
      success: true,
      response: agentResponse
    });

  } catch (error: any) {
    console.error('Error in text conversation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
