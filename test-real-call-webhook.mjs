const payload = {
  event: "call_started",
  call: {
    call_id: "call_8a6ae51f115dd6c9e6a3bf69bda",
    agent_id: "agent_fc977a82b680b6dfae4bfa7a15",
    from_number: "+15551234567",
    to_number: "+15559876543",
    start_timestamp: new Date(1771033943845).toISOString(),
    metadata: {
      agent_id: "f02fd2dc-32d7-42b8-8378-126d354798f7",
      user_id: "unknown",
      test_mode: "true",
      prompt_version: "5"
    }
  }
};

console.log('🧪 Testing webhook with your real call data...');
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('');

const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

console.log('Response Status:', response.status);
const result = await response.json();
console.log('Response Body:', result);

// Wait and check database
await new Promise(r => setTimeout(r, 2000));

const dbCheck = await fetch(
  `https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.call_8a6ae51f115dd6c9e6a3bf69bda`,
  {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
    }
  }
);

const dbData = await dbCheck.json();

if (dbData.length > 0) {
  console.log('\n✅ Call now in database!');
  console.log('This means webhook processing works when called manually.');
  console.log('');
  console.log('❌ PROBLEM: Retell is not sending webhooks to our endpoint');
} else {
  console.log('\n❌ Call still NOT in database even after manual webhook');
  console.log('This means there is a problem with the webhook handler itself.');
}
