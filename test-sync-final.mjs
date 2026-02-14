import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
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

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n🧪 Testing Sync with Fixed Code\n');

const callsList = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 100,
  sort_order: 'descending'
});

let syncedCount = 0, updatedCount = 0, skippedCount = 0;

for (const call of callsList) {
  if (call.agent_id !== dentalRetellAgentId) {
    skippedCount++;
    continue;
  }

  const { data: existingCall } = await supabase
    .from('calls')
    .select('id')
    .eq('retell_call_id', call.call_id)
    .single();

  const callData = {
    retell_call_id: call.call_id,
    agent_id: dentalAgentId,
    from_number: call.from_number || null,
    to_number: call.to_number || null,
    retell_agent_id: call.agent_id || null,
    started_at: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : new Date().toISOString(),
    ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
    duration_ms: call.call_duration_ms || call.duration_ms || null,
    transcript: typeof call.transcript === 'string' ? call.transcript : null,
    transcript_object: call.transcript_object || null,
    recording_url: call.recording_url || null,
    public_log_url: call.public_log_url || null,
    call_status: call.call_status || (call.end_timestamp ? 'completed' : 'in_progress'),
    disconnection_reason: call.disconnection_reason || null,
    call_analysis: call.call_analysis || null
  };

  if (existingCall) {
    const { error } = await supabase.from('calls').update(callData).eq('id', existingCall.id);
    if (!error) updatedCount++;
  } else {
    const { error } = await supabase.from('calls').insert(callData);
    if (!error) syncedCount++;
    else console.log('❌ Insert error:', error.message);
  }
}

console.log(`✅ Synced: ${syncedCount} new`);
console.log(`📝 Updated: ${updatedCount} existing`);
console.log(`❌ Skipped: ${skippedCount} from other agents`);
console.log(`📊 Total: ${callsList.length}\n`);

const { data: dbCalls } = await supabase
  .from('calls')
  .select('retell_call_id, retell_agent_id, from_number, to_number')
  .eq('agent_id', dentalAgentId);

console.log(`🗄️  Database: ${dbCalls?.length || 0} calls for dental agent\n`);
if (dbCalls) {
  dbCalls.forEach(call => {
    const match = call.retell_agent_id === dentalRetellAgentId ? '✅' : '❌';
    console.log(`${match} ${call.retell_call_id.slice(0, 20)}... | ${call.from_number || 'no from'} → ${call.to_number || 'no to'}`);
  });
}
