import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('prompt_versions')
    .select('version_number, prompt_personality, prompt_call_flow, change_summary, created_at')
    .eq('agent_id', agentId)
    .in('version_number', [8, 9, 10])
    .order('version_number', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const analysis = data.map(v => ({
    version: v.version_number,
    change: v.change_summary || 'N/A',
    created_at: v.created_at,
    personality_start: v.prompt_personality.substring(0, 200),
    personality_end: v.prompt_personality.substring(v.prompt_personality.length - 200),
    personality_length: v.prompt_personality.length,
    call_flow_start: v.prompt_call_flow.substring(0, 200),
    call_flow_end: v.prompt_call_flow.substring(v.prompt_call_flow.length - 200),
    call_flow_length: v.prompt_call_flow.length,
  }));

  return NextResponse.json({ versions: analysis }, { status: 200 });
}
