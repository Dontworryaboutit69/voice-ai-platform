import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { content, sourceDescription, agentContext } = await request.json();

    // Use Claude to create a well-formatted KB item with an appropriate name
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are creating a knowledge base item for a ${agentContext || 'business'} voice AI agent.

Source: ${sourceDescription}

Raw content:
${content}

Please:
1. Create an appropriate KB name in format KB_[CATEGORY] (e.g., KB_SERVICES, KB_PRICING, KB_POLICIES)
2. Format the content in a clean, structured way that's easy for an AI agent to reference
3. Use clear headers, bullet points, and organized sections
4. Remove any irrelevant information

Return your response in this exact format:
NAME: KB_[YOUR_NAME_HERE]
CONTENT:
[Your formatted content here]`
      }]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the response
    const nameMatch = response.match(/NAME:\s*(KB_\w+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);

    const name = nameMatch ? nameMatch[1] : 'KB_CUSTOM';
    const formattedContent = contentMatch ? contentMatch[1].trim() : content;

    return NextResponse.json({
      success: true,
      name,
      formattedContent
    });

  } catch (error: any) {
    console.error('Error formatting KB content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to format content' },
      { status: 500 }
    );
  }
}
