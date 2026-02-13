import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

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

    // Create new prompt version
    const { data: newVersion, error: versionError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agentId,
        version_number: newVersionNumber,
        compiled_prompt: compiledPrompt,
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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

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
