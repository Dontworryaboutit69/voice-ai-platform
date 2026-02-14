// Test webhook after adding environment variables
const callStartedPayload = {
  event: "call_started",
  call: {
    call_id: "test_after_env_" + Date.now(),
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

console.log('Testing webhook after environment variables added...');
console.log('Call ID:', callStartedPayload.call.call_id);

const webhookResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(callStartedPayload)
});

console.log('\nWebhook response:', webhookResponse.status);
const result = await webhookResponse.json();
console.log('Response body:', result);

if (!webhookResponse.ok) {
  console.log('\n❌ Webhook rejected');
  process.exit(1);
}

console.log('\n✅ Webhook accepted. Waiting 5 seconds for database insert...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Check database
const dbCheck = await fetch(
  `https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.${callStartedPayload.call.call_id}&select=*`,
  {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
    }
  }
);

const dbResult = await dbCheck.json();

if (dbResult.length > 0) {
  console.log('\n🎉🎉🎉 SUCCESS! WEBHOOKS ARE WORKING!');
  console.log('\nCall saved to database:');
  console.log('  Database ID:', dbResult[0].id);
  console.log('  Retell Call ID:', dbResult[0].retell_call_id);
  console.log('  Agent ID:', dbResult[0].agent_id);
  console.log('  Status:', dbResult[0].call_status);
  console.log('\n✅ Environment variables are configured correctly!');
  console.log('✅ Webhook handler can write to database!');
  console.log('\n🚀 You can now test with a real voice call!');
} else {
  console.log('\n❌ Still not working - call not in database');
  console.log('\nThis means the environment variables need a redeploy to take effect.');
  console.log('The env vars are added, but the current deployment doesn\'t have them yet.');
}
