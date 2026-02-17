import 'dotenv/config';
import { createServiceClient } from '../lib/supabase/client';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function checkCallEnded() {
  const supabase = createServiceClient();

  const { data: calls } = await supabase
    .from('calls')
    .select('retell_call_id, started_at, ended_at, duration_ms, call_status, transcript')
    .eq('agent_id', AGENT_ID)
    .order('started_at', { ascending: false })
    .limit(5);

  console.log('=== Recent Calls ===\n');

  calls?.forEach((call, i) => {
    console.log(`${i + 1}. Call: ${call.retell_call_id}`);
    console.log(`   Status: ${call.call_status}`);
    console.log(`   Started: ${call.started_at}`);
    console.log(`   Ended: ${call.ended_at || '❌ NOT ENDED'}`);
    console.log(`   Duration: ${call.duration_ms || '❌ NO DURATION'} ms`);
    console.log(`   Has transcript: ${call.transcript ? '✅ Yes' : '❌ No'}`);
    console.log('');
  });
}

checkCallEnded().catch(console.error);
