import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    // Extract and format content using Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Extract and clean the main content from this document. Remove any formatting artifacts, headers, footers, page numbers, and other non-essential elements. Return the content in a clean, readable format suitable for a knowledge base.

Document content:
${text.substring(0, 50000)}

Return the extracted content organized in a clear structure.`
      }]
    });

    const extractedContent = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      success: true,
      content: extractedContent
    });

  } catch (error: any) {
    console.error('Error extracting file content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to extract content from file' },
      { status: 500 }
    );
  }
}
