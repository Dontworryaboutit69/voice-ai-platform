import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

// Test call_started event
const callStartedPayload = {
  event: 'call_started',
  call: {
    call_id: 'test_webhook_' + Date.now(),
    agent_id: dentalRetellAgentId,
    from_number: '+15551234567',
    to_number: '+15559876543',
    start_timestamp: new Date().toISOString(),
    metadata: {
      agent_id: dentalAgentId,
      user_id: 'test-user',
      test_mode: 'true'
    }
  }
};

console.log('\n🧪 Testing webhook with call_started event...\n');
console.log('Payload:', JSON.stringify(callStartedPayload, null, 2));

const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(callStartedPayload)
});

const result = await response.json();
console.log('\nResponse:', result);
console.log('Status:', response.status);

if (response.ok) {
  console.log('\n✅ Webhook accepted the event!');
  console.log('Now checking database...\n');
  
  // Wait a moment for database insert
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if call was stored
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: call } = await supabase
    .from('calls')
    .select('*')
    .eq('retell_call_id', callStartedPayload.call.call_id)
    .single();
    
  if (call) {
    console.log('✅ Call found in database!');
    console.log('Call:', call);
  } else {
    console.log('❌ Call NOT found in database - webhook processed but did not store');
  }
} else {
  console.log('\n❌ Webhook rejected the event');
}
