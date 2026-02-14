import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const { data: calls } = await supabase
  .from('calls')
  .select('*')
  .eq('agent_id', dentalAgentId)
  .order('started_at', { ascending: false })
  .limit(1);

if (calls && calls.length > 0) {
  const call = calls[0];
  console.log('\n📞 Latest call in database:\n');
  console.log('ID:', call.retell_call_id);
  console.log('Status:', call.call_status);
  console.log('Started:', call.started_at);
  console.log('Ended:', call.ended_at);
  console.log('Duration:', call.duration_ms ? `${Math.round(call.duration_ms / 1000)}s` : 'N/A');
  console.log('Has transcript:', call.transcript ? 'YES' : 'NO');
  console.log('Has recording:', call.recording_url ? 'YES' : 'NO');
}
