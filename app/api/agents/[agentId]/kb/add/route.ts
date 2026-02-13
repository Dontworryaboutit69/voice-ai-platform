import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { name, content } = await request.json();

    const supabase = createServiceClient();

    // Get current prompt
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

    // Add new KB item to the prompt
    const kbItem = `\n\n### ${name}\nName: ${name}\nContent:\n${content}`;

    // Find where to insert (before or after existing KB content)
    let updatedPrompt = currentPrompt.compiled_prompt;

    if (updatedPrompt.includes('## KNOWLEDGE BASE CONTENT')) {
      // Append to existing KB section
      updatedPrompt = updatedPrompt + kbItem;
    } else if (updatedPrompt.includes('## 6. Knowledge Base')) {
      // Create KB content section
      const kb6Index = updatedPrompt.indexOf('## 6. Knowledge Base');
      const insertPoint = updatedPrompt.indexOf('\n\n', kb6Index) + 2;
      updatedPrompt =
        updatedPrompt.substring(0, insertPoint) +
        '\n---\n\n## KNOWLEDGE BASE CONTENT\n' +
        kbItem +
        '\n\n' +
        updatedPrompt.substring(insertPoint);
    } else {
      // Add KB section at the end
      updatedPrompt = updatedPrompt + '\n\n---\n\n## KNOWLEDGE BASE CONTENT\n' + kbItem;
    }

    // Create new prompt version
    const newVersionNumber = currentPrompt.version_number + 1;
    const { data: newVersion, error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agentId,
        version_number: newVersionNumber,
        compiled_prompt: updatedPrompt,
        generation_method: 'user_edited',
        parent_version_id: currentPrompt.id,
        change_summary: `Added knowledge base item: ${name}`,
        token_count: updatedPrompt.split(' ').length
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
      .update({ current_prompt_id: newVersion.id })
      .eq('id', agentId);

    return NextResponse.json({
      success: true,
      versionNumber: newVersionNumber
    });

  } catch (error: any) {
    console.error('Error adding KB item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add KB item' },
      { status: 500 }
    );
  }
}
