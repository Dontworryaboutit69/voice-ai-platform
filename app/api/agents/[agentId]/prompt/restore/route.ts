import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: 'Version ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get the version to restore
    const { data: versionToRestore, error: versionError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('id', versionId)
      .eq('agent_id', agentId)
      .single();

    if (versionError || !versionToRestore) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    // Update agent's current prompt to this version
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        current_prompt_id: versionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to restore version' },
        { status: 500 }
      );
    }

    // Update Retell agent if connected
    const { data: agent } = await supabase
      .from('agents')
      .select('retell_agent_id')
      .eq('id', agentId)
      .single();

    if (agent?.retell_agent_id) {
      try {
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
            general_prompt: versionToRestore.compiled_prompt,
            webhook_url: `${appUrl}/api/webhooks/retell/call-events`
          })
        });
      } catch (retellError) {
        console.error('Error updating Retell agent:', retellError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Restored to version ${versionToRestore.version_number}`,
      versionNumber: versionToRestore.version_number
    });

  } catch (error: any) {
    console.error('Error in restore API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to restore version' },
      { status: 500 }
    );
  }
}
