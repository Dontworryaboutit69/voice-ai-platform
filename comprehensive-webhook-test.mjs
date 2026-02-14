const payload = {
  event: "call_started",
  call: {
    call_id: `comprehensive_test_${Date.now()}`,
    agent_id: "agent_562033eb10ac620d3ea30aa07f",
    from_number: "+15555551234",
    to_number: "+15555555678",
    start_timestamp: new Date().toISOString(),
    metadata: {
      agent_id: "f02fd2dc-32d7-42b8-8378-126d354798f7",
      test_mode: "true"
    }
  }
};

console.log('🚀 Sending webhook call_started event...');
console.log('Call ID:', payload.call.call_id);
console.log('Payload:', JSON.stringify(payload, null, 2));

const webhookResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

console.log('\n📡 Webhook Response Status:', webhookResponse.status);
const webhookResult = await webhookResponse.json();
console.log('Webhook Response Body:', webhookResult);

// Wait for serverless function to complete
console.log('\n⏳ Waiting 3 seconds for processing...');
await new Promise(r => setTimeout(r, 3000));

// Check database
console.log('\n🔍 Checking database...');
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
  console.log('\n✅ SUCCESS! Call saved to database!');
  console.log('Database record:', JSON.stringify(dbResult[0], null, 2));
} else {
  console.log('\n❌ FAILED! Call NOT in database');
  console.log('Database response:', dbResult);

  // Check Vercel logs
  console.log('\n📋 Fetching Vercel logs for diagnostics...');
  console.log('Run: vercel logs https://voice-ai-platform-orcin.vercel.app --follow');
}
