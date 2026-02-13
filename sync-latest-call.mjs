import Retell from 'retell-sdk';

const RETELL_API_KEY = 'key_85da79d1d9da73aee899af323f23';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const SUPABASE_URL = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const retell = new Retell({ apiKey: RETELL_API_KEY });

try {
  const call = await retell.call.retrieve('call_54ea607eb94eacd2cdbb9b3ece9');
  
  console.log('=== Latest Call Details ===');
  console.log('Call ID:', call.call_id);
  console.log('Status:', call.call_status);
  console.log('Duration:', call.call_duration_ms || call.duration_ms, 'ms');
  console.log('Has Transcript:', !!call.transcript);
  console.log('Has Recording:', !!call.recording_url);
  
  // Only use columns that exist in the database
  const callData = {
    retell_call_id: call.call_id,
    agent_id: AGENT_ID,
    from_number: call.from_number || null,
    to_number: call.to_number || null,
    started_at: call.start_timestamp ? new Date(parseInt(call.start_timestamp)).toISOString() : new Date().toISOString(),
    ended_at: call.end_timestamp ? new Date(parseInt(call.end_timestamp)).toISOString() : null,
    duration_ms: call.call_duration_ms || call.duration_ms || null,
    transcript: typeof call.transcript === 'string' ? call.transcript : null,
    transcript_object: call.transcript_object || null,
    recording_url: call.recording_url || null,
    call_status: call.call_status === 'ended' ? 'completed' : call.call_status,
    call_analysis: call.call_analysis || null
  };
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/calls`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(callData)
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('\n✅ Successfully synced latest call!');
    console.log('Database ID:', data[0]?.id);
    console.log('Now you should see 7 calls in the dashboard');
  } else {
    const error = await response.text();
    console.error('\n❌ Failed to sync:', error);
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
