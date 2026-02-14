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

console.log('\n🗄️  All calls in database for dental agent:\n');

const { data: calls } = await supabase
  .from('calls')
  .select('*')
  .eq('agent_id', dentalAgentId)
  .order('started_at', { ascending: false });

console.log(`Total: ${calls?.length || 0} calls\n`);

if (calls && calls.length > 0) {
  calls.forEach((call, idx) => {
    console.log(`${idx + 1}. ${call.retell_call_id}`);
    console.log(`   Status: ${call.call_status}`);
    console.log(`   Started: ${call.started_at}`);
    console.log(`   Ended: ${call.ended_at || 'N/A'}`);
    console.log(`   Has transcript: ${call.transcript_object ? 'YES' : 'NO'}`);
    console.log('');
  });
}

// Check last hour specifically
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { data: recentCalls } = await supabase
  .from('calls')
  .select('*')
  .eq('agent_id', dentalAgentId)
  .gte('started_at', oneHourAgo);

console.log(`\n📅 Calls in last hour: ${recentCalls?.length || 0}`);
if (recentCalls && recentCalls.length > 0) {
  recentCalls.forEach(call => {
    console.log(`  - ${call.retell_call_id} at ${call.started_at}`);
  });
}
