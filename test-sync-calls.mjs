import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

// Read .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const retell = new Retell({
  apiKey: envVars.RETELL_API_KEY,
});

// Dental agent info
const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n=== Testing Sync Calls Logic ===\n');
console.log(`Agent: Elite Dental Care`);
console.log(`DB Agent ID: ${dentalAgentId}`);
console.log(`Retell Agent ID: ${dentalRetellAgentId}\n`);

// Fetch calls from Retell
console.log('Fetching calls from Retell...');
const callsList = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 100,
  sort_order: 'descending'
});

console.log(`Retell returned ${callsList.length} calls\n`);

let syncedCount = 0;
let updatedCount = 0;
let skippedCount = 0;

// Process each call with the NEW filtering logic
for (const callRaw of callsList) {
  const call = callRaw;

  // CRITICAL: Filter out calls from other agents
  if (call.agent_id !== dentalRetellAgentId) {
    console.log(`❌ SKIP: Call ${call.call_id} belongs to ${call.agent_id}`);
    skippedCount++;
    continue;
  }

  console.log(`✅ KEEP: Call ${call.call_id} belongs to ${call.agent_id}`);
  
  // Check if call already exists
  const { data: existingCall } = await supabase
    .from('calls')
    .select('id, retell_call_id')
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
    call_analysis: call.call_analysis || null,
    call_summary: call.call_analysis?.call_summary || null,
    sentiment: call.call_analysis?.user_sentiment || null
  };

  if (existingCall) {
    // Update
    const { error } = await supabase
      .from('calls')
      .update(callData)
      .eq('id', existingCall.id);

    if (!error) {
      console.log(`   📝 Updated existing call`);
      updatedCount++;
    } else {
      console.log(`   ❌ Error updating:`, error.message);
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('calls')
      .insert(callData);

    if (!error) {
      console.log(`   ➕ Inserted new call`);
      syncedCount++;
    } else {
      console.log(`   ❌ Error inserting:`, error.message);
    }
  }
}

console.log('\n=== RESULTS ===');
console.log(`✅ Synced: ${syncedCount} new calls`);
console.log(`📝 Updated: ${updatedCount} existing calls`);
console.log(`❌ Skipped: ${skippedCount} calls from other agents`);
console.log(`📊 Total processed: ${callsList.length} calls`);

// Verify database state
const { data: dbCalls } = await supabase
  .from('calls')
  .select('retell_call_id, agent_id, retell_agent_id')
  .eq('agent_id', dentalAgentId);

console.log('\n=== Database Verification ===');
console.log(`Calls in DB for dental agent: ${dbCalls.length}`);
dbCalls.forEach(call => {
  const match = call.retell_agent_id === dentalRetellAgentId ? '✅' : '❌';
  console.log(`${match} ${call.retell_call_id} - Retell Agent: ${call.retell_agent_id}`);
});
