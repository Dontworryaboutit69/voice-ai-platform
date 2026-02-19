import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { url } = await request.json();

    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Extract clean text content using Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Extract the main content from this HTML webpage. Remove navigation, headers, footers, ads, and other non-essential elements. Return only the core informational content in clean, readable text format.

HTML:
${html.substring(0, 50000)}

Return the extracted content in a format suitable for a knowledge base.`
      }]
    });

    const extractedContent = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      success: true,
      content: extractedContent
    });

  } catch (error: any) {
    console.error('Error extracting URL content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to extract content from URL' },
      { status: 500 }
    );
  }
}
