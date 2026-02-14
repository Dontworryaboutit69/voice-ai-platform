import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
);

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('🔄 Re-importing Test Agent calls with complete data...\n');

const calls = await retell.call.list({
  agent_id: 'agent_fc977a82b680b6dfae4bfa7a15',
  limit: 10,
  sort_order: 'descending'
});

console.log(`Found ${calls.length} calls\n`);

for (const call of calls) {
  console.log(`Processing ${call.call_id}...`);
  console.log(`  Status: ${call.call_status}`);
  console.log(`  Duration: ${call.call_duration_ms || call.duration_ms || 'N/A'}`);
  console.log(`  From: ${call.from_number || 'N/A'}`);
  console.log(`  To: ${call.to_number || 'N/A'}`);
  
  const { data, error } = await supabase
    .from('calls')
    .upsert({
      retell_call_id: call.call_id,
      agent_id: 'f02fd2dc-32d7-42b8-8378-126d354798f7',
      from_number: call.from_number || null,
      to_number: call.to_number || null,
      started_at: new Date(call.start_timestamp).toISOString(),
      ended_at: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
      duration_ms: call.call_duration_ms || call.duration_ms || null,
      transcript: call.transcript || null,
      transcript_object: call.transcript_object || null,
      recording_url: call.recording_url || null,
      call_status: call.call_status === 'ended' ? 'completed' : call.call_status,
      call_analysis: call.call_analysis || null
    }, {
      onConflict: 'retell_call_id'
    })
    .select();
  
  if (error) {
    console.log('  ❌ Error:', error.message);
  } else {
    console.log('  ✅ Updated with complete data');
  }
  console.log('');
}

console.log('✅ All calls re-imported with complete data!');
