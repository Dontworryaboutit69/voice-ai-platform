import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

const SUPABASE_URL = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

try {
  const calls = await retell.call.list({
    filter_agent_id: 'agent_a5f4f85fae3d437567417811e6',
    limit: 5,
    sort_order: 'descending'
  });
  
  console.log(`Syncing ${calls.length} most recent calls...\n`);
  
  let inserted = 0;
  
  for (const call of calls) {
    // Check if exists
    const checkResp = await fetch(
      `${SUPABASE_URL}/rest/v1/calls?select=id&retell_call_id=eq.${call.call_id}`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }}
    );
    
    if ((await checkResp.json()).length > 0) continue;
    
    // Insert with only core fields
    const callData = {
      retell_call_id: call.call_id,
      agent_id: AGENT_ID,
      started_at: call.start_timestamp ? new Date(parseInt(call.start_timestamp)).toISOString() : new Date().toISOString(),
      ended_at: call.end_timestamp ? new Date(parseInt(call.end_timestamp)).toISOString() : null,
      duration_ms: call.call_duration_ms || call.duration_ms || null,
      transcript: typeof call.transcript === 'string' ? call.transcript : null,
      recording_url: call.recording_url || null,
      call_status: call.call_status === 'ended' ? 'completed' : call.call_status
    };
    
    const resp = await fetch(
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
    
    if (resp.ok) {
      inserted++;
      const dur = Math.round((call.call_duration_ms || call.duration_ms) / 1000);
      console.log(`  ✅ ${call.call_id.slice(5, 20)}... (${dur}s, ${call.call_status})`);
    } else {
      const error = await resp.text();
      console.log(`  ❌ ${call.call_id.slice(5, 20)}...`, error.slice(0, 80));
    }
  }
  
  console.log(`\n✅ Synced ${inserted} calls`);
} catch (error) {
  console.error('Error:', error.message);
}
