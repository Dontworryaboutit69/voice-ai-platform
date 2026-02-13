import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get current prompt version
    const { data: promptVersion, error: promptError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('id', agent.current_prompt_id)
      .single();

    if (promptError || !promptVersion) {
      return NextResponse.json(
        { success: false, error: 'Prompt version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agent,
      promptVersion
    });

  } catch (error) {
    console.error('Error fetching agent prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
