const payload = {
  event: "call_started",
  call: {
    call_id: `final_test_${Date.now()}`,
    agent_id: "agent_562033eb10ac620d3ea30aa07f",
    from_number: "+15555551234",
    to_number: "+15555555678",
    start_timestamp: Date.now().toString(),
    metadata: {
      agent_id: "f02fd2dc-32d7-42b8-8378-126d354798f7",
      test_mode: "true"
    }
  }
};

console.log('Sending webhook exactly like Retell would...');
console.log('Call ID:', payload.call.call_id);

const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

console.log('Status:', response.status);
const result = await response.json();
console.log('Response:', result);

// Wait then check database
console.log('\nWaiting 5 seconds...');
await new Promise(r => setTimeout(r, 5000));

const dbCheck = await fetch(
  `https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.${payload.call.call_id}`,
  {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
    }
  }
);

const dbResult = await dbCheck.json();

if (dbResult.length > 0) {
  console.log('\n🎉 SUCCESS! Webhook saved to database!');
  console.log('Call in database:', dbResult[0]);
} else {
  console.log('\n❌ Call NOT in database');
  console.log('The insert is failing silently');
}
