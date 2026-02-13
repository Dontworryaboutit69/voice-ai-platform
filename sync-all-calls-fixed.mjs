import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

const SUPABASE_URL = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

try {
  // Get all calls from Retell
  const calls = await retell.call.list({
    filter_agent_id: 'agent_a5f4f85fae3d437567417811e6',
    limit: 100,
    sort_order: 'descending'
  });
  
  console.log(`Found ${calls.length} calls in Retell\n`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const call of calls) {
    // Check if call already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/calls?select=id&retell_call_id=eq.${call.call_id}`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    const existing = await checkResponse.json();
    
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    
    // Insert new call (without call_summary and sentiment - those columns don't exist)
    const callData = {
      retell_call_id: call.call_id,
      agent_id: AGENT_ID,
      from_number: call.from_number || null,
      to_number: call.to_number || null,
      retell_agent_id: call.agent_id || null,
      started_at: call.start_timestamp ? new Date(parseInt(call.start_timestamp)).toISOString() : new Date().toISOString(),
      ended_at: call.end_timestamp ? new Date(parseInt(call.end_timestamp)).toISOString() : null,
      duration_ms: call.call_duration_ms || call.duration_ms || null,
      transcript: typeof call.transcript === 'string' ? call.transcript : null,
      transcript_object: call.transcript_object || null,
      recording_url: call.recording_url || null,
      public_log_url: call.public_log_url || null,
      call_status: call.call_status === 'ended' ? 'completed' : call.call_status,
      disconnection_reason: call.disconnection_reason || null,
      call_analysis: call.call_analysis || null
    };
    
    const insertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/calls`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(callData)
      }
    );
    
    if (insertResponse.ok) {
      inserted++;
      console.log(`  ✅ Inserted call ${call.call_id.slice(0, 20)}... (${call.call_status})`);
    } else {
      const error = await insertResponse.text();
      console.log(`  ❌ Failed: ${call.call_id.slice(0, 20)}...`, error.slice(0, 100));
    }
  }
  
  console.log(`\n✅ Sync complete! Inserted: ${inserted}, Skipped: ${skipped}`);
} catch (error) {
  console.error('Error:', error.message);
}
