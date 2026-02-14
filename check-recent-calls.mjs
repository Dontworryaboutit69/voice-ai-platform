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

console.log('\n🔍 Checking recent calls in database...\n');

// Get all calls from last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

const { data: allCalls, error: allError } = await supabase
  .from('calls')
  .select('*')
  .gte('started_at', oneHourAgo)
  .order('started_at', { ascending: false });

console.log(`📊 Total calls in last hour: ${allCalls?.length || 0}\n`);

if (allCalls && allCalls.length > 0) {
  allCalls.forEach(call => {
    const isDental = call.agent_id === dentalAgentId ? '✅ DENTAL' : '❌ OTHER';
    console.log(`${isDental} | ${call.retell_call_id}`);
    console.log(`   Agent: ${call.agent_id}`);
    console.log(`   Status: ${call.call_status}`);
    console.log(`   Started: ${call.started_at}`);
    console.log(`   From: ${call.from_number || 'N/A'} → To: ${call.to_number || 'N/A'}`);
    console.log('');
  });
}

// Check specifically for dental agent
const { data: dentalCalls } = await supabase
  .from('calls')
  .select('*')
  .eq('agent_id', dentalAgentId)
  .order('started_at', { ascending: false })
  .limit(5);

console.log(`\n🦷 Dental agent calls (last 5):\n`);
if (dentalCalls && dentalCalls.length > 0) {
  dentalCalls.forEach(call => {
    console.log(`- ${call.retell_call_id} | ${call.call_status} | ${call.started_at}`);
  });
} else {
  console.log('No calls found for dental agent');
}
