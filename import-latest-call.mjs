import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('📥 Importing your latest call...\n');

const call = await retell.call.retrieve('call_234e01447654764f9396ec21f14');

console.log('Call Details:');
console.log('  ID:', call.call_id);
console.log('  Duration:', call.call_duration_ms ? `${Math.ceil(call.call_duration_ms / 60000)}m` : 'N/A');
console.log('  Has Transcript:', !!call.transcript);
console.log('  Has Recording:', !!call.recording_url);
console.log('');

// Send to webhook
const payload = {
  event: "call_ended",
  call: {
    call_id: call.call_id,
    agent_id: call.agent_id,
    from_number: call.from_number,
    to_number: call.to_number,
    start_timestamp: new Date(call.start_timestamp).toISOString(),
    end_timestamp: new Date(call.end_timestamp).toISOString(),
    duration_ms: call.call_duration_ms,
    call_duration_ms: call.call_duration_ms,
    transcript: call.transcript,
    transcript_object: call.transcript_object,
    recording_url: call.recording_url,
    call_status: call.call_status,
    metadata: call.metadata || { agent_id: "f02fd2dc-32d7-42b8-8378-126d384798f7" }
  }
};

console.log('Sending to webhook...');
const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

console.log('Response:', response.status);

await new Promise(r => setTimeout(r, 2000));

const dbCheck = await fetch(
  `https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.${call.call_id}`,
  {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
    }
  }
);

const dbData = await dbCheck.json();

if (dbData.length > 0) {
  console.log('✅ Call imported successfully!');
  console.log('View it in dashboard: https://voice-ai-platform-orcin.vercel.app/agents/f02fd2dc-32d7-42b8-8378-126d354798f7');
} else {
  console.log('❌ Import failed');
}
