import Retell from 'retell-sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n🔍 Debugging sync logic...\n');

// Get agent from DB
const { data: agent } = await supabase
  .from('agents')
  .select('retell_agent_id, id')
  .eq('id', dentalAgentId)
  .single();

console.log('Agent from DB:', agent);

// Fetch calls from Retell
const callsList = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 100,
  sort_order: 'descending'
});

console.log(`\nTotal calls from Retell: ${callsList.length}`);

// Process first 5 dental calls
let dentalCount = 0;
for (const call of callsList) {
  if (call.agent_id === dentalRetellAgentId) {
    dentalCount++;
    if (dentalCount <= 5) {
      console.log(`\n--- Dental Call #${dentalCount}: ${call.call_id} ---`);
      console.log(`Status: ${call.call_status}`);
      console.log(`End timestamp: ${call.end_timestamp}`);
      console.log(`Has transcript: ${call.transcript ? 'YES' : 'NO'}`);
      console.log(`Has recording: ${call.recording_url ? 'YES' : 'NO'}`);

      // Normalize status (same logic as sync endpoint)
      let normalizedStatus = call.call_status;
      if (normalizedStatus === 'ended' || normalizedStatus === 'error') {
        normalizedStatus = (call.end_timestamp || call.transcript || call.recording_url) ? 'completed' : 'in_progress';
      }
      if (!normalizedStatus) {
        normalizedStatus = call.end_timestamp ? 'completed' : 'in_progress';
      }
      console.log(`Normalized status: ${normalizedStatus}`);

      // Check if exists in DB
      const { data: existingCall } = await supabase
        .from('calls')
        .select('id, retell_call_id, call_status')
        .eq('retell_call_id', call.call_id)
        .single();

      if (existingCall) {
        console.log(`✅ EXISTS in DB: ${existingCall.id} (status: ${existingCall.call_status})`);
      } else {
        console.log(`❌ NOT in DB - would be INSERTED`);
      }
    }
  }
}

console.log(`\n📊 Total dental calls found: ${dentalCount}`);
