// More detailed webhook test
const callStartedPayload = {
  event: "call_started",
  call: {
    call_id: "test_detailed_789",
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

console.log('Step 1: Sending webhook to production...');

const webhookResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(callStartedPayload)
});

console.log('Webhook response status:', webhookResponse.status);
const webhookResult = await webhookResponse.json();
console.log('Webhook response body:', webhookResult);

if (!webhookResponse.ok) {
  console.log('\n❌ Webhook was rejected');
  process.exit(1);
}

console.log('\n✅ Webhook accepted');

// Wait for processing
console.log('\nStep 2: Waiting 3 seconds for database insert...');
await new Promise(resolve => setTimeout(resolve, 3000));

// Check database
console.log('\nStep 3: Checking if call exists in database...');
const dbCheck = await fetch(
  'https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.test_detailed_789&select=*',
  {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
    }
  }
);

const dbResult = await dbCheck.json();

if (dbResult.length > 0) {
  console.log('\n✅✅✅ SUCCESS! Call was saved to database!');
  console.log('\nCall details:');
  console.log('  Database ID:', dbResult[0].id);
  console.log('  Retell Call ID:', dbResult[0].retell_call_id);
  console.log('  Agent ID:', dbResult[0].agent_id);
  console.log('  Status:', dbResult[0].call_status);
  console.log('  Created:', dbResult[0].created_at);
  console.log('\n🎉 WEBHOOKS ARE WORKING! You can now test with a real call.');
} else {
  console.log('\n❌ PROBLEM: Call was NOT saved to database');
  console.log('\nThis means:');
  console.log('  1. Webhook endpoint received the request (200 OK)');
  console.log('  2. But the database insert failed silently');
  console.log('  3. Most likely cause: SUPABASE_SERVICE_ROLE_KEY not set in Vercel');
  console.log('\nNEXT STEPS:');
  console.log('  1. Go to: https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/environment-variables');
  console.log('  2. Add: SUPABASE_SERVICE_ROLE_KEY');
  console.log('  3. Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE');
  console.log('  4. Apply to: Production, Preview, Development');
  console.log('  5. Redeploy');
}
