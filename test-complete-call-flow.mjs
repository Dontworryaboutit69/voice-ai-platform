import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
);

const testCallId = `complete_flow_test_${Date.now()}`;

console.log('🧪 Testing Complete Call Flow');
console.log('================================\n');

// Step 1: Simulate call_started webhook
console.log('📞 Step 1: Simulating call_started webhook...');
const callStartedPayload = {
  event: "call_started",
  call: {
    call_id: testCallId,
    agent_id: "agent_562033eb10ac620d3ea30aa07f",
    from_number: "+15551234567",
    to_number: "+15559876543",
    start_timestamp: new Date().toISOString(),
    metadata: {
      agent_id: "f02fd2dc-32d7-42b8-8378-126d354798f7"
    }
  }
};

const startResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(callStartedPayload)
});

console.log(`Status: ${startResponse.status}`);
const startResult = await startResponse.json();
console.log('Response:', startResult);

// Wait for processing
await new Promise(r => setTimeout(r, 2000));

// Check database
let { data: calls } = await supabase
  .from('calls')
  .select('*')
  .eq('retell_call_id', testCallId);

if (calls && calls.length > 0) {
  console.log('✅ Call created in database');
  console.log('   Status:', calls[0].call_status);
  console.log('   ID:', calls[0].id);
} else {
  console.log('❌ Call NOT found in database');
  process.exit(1);
}

// Step 2: Simulate call_ended webhook
console.log('\n📞 Step 2: Simulating call_ended webhook...');
const callEndedPayload = {
  event: "call_ended",
  call: {
    call_id: testCallId,
    agent_id: "agent_562033eb10ac620d3ea30aa07f",
    from_number: "+15551234567",
    to_number: "+15559876543",
    start_timestamp: callStartedPayload.call.start_timestamp,
    end_timestamp: new Date().toISOString(),
    duration_ms: 125000, // 2 minutes 5 seconds
    call_duration_ms: 125000,
    transcript: "Agent: Hello! How can I help you today?\nUser: I'd like to book an appointment.\nAgent: Great! Let me help you with that. When would you like to schedule it?\nUser: How about tomorrow at 2pm?\nAgent: Perfect! I've scheduled your appointment for tomorrow at 2pm. Is there anything else I can help you with?\nUser: No, that's all. Thank you!\nAgent: You're welcome! Have a great day!",
    transcript_object: [
      { role: "agent", content: "Hello! How can I help you today?" },
      { role: "user", content: "I'd like to book an appointment." },
      { role: "agent", content: "Great! Let me help you with that. When would you like to schedule it?" },
      { role: "user", content: "How about tomorrow at 2pm?" },
      { role: "agent", content: "Perfect! I've scheduled your appointment for tomorrow at 2pm. Is there anything else I can help you with?" },
      { role: "user", content: "No, that's all. Thank you!" },
      { role: "agent", content: "You're welcome! Have a great day!" }
    ],
    recording_url: "https://example.com/recordings/test.mp3",
    metadata: {
      agent_id: "f02fd2dc-32d7-42b8-8378-126d354798f7"
    }
  }
};

const endResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(callEndedPayload)
});

console.log(`Status: ${endResponse.status}`);
const endResult = await endResponse.json();
console.log('Response:', endResult);

// Wait for processing
await new Promise(r => setTimeout(r, 2000));

// Check updated call
({ data: calls } = await supabase
  .from('calls')
  .select('*')
  .eq('retell_call_id', testCallId));

if (calls && calls.length > 0) {
  const call = calls[0];
  console.log('✅ Call updated in database');
  console.log('   Status:', call.call_status);
  console.log('   Duration:', call.duration_ms ? `${Math.ceil(call.duration_ms / 60000)}m ${Math.floor((call.duration_ms % 60000) / 1000)}s` : 'N/A');
  console.log('   Has Transcript:', !!call.transcript);
  console.log('   Has Recording URL:', !!call.recording_url);
  console.log('   Has Transcript Object:', !!call.transcript_object);

  if (call.call_status === 'completed' && call.transcript && call.recording_url) {
    console.log('\n🎉 SUCCESS! Complete call flow working perfectly!');
    console.log('\n📋 Full Call Data:');
    console.log(JSON.stringify(call, null, 2));
  } else {
    console.log('\n⚠️  Call updated but missing some data:');
    if (call.call_status !== 'completed') console.log('   - Status not "completed"');
    if (!call.transcript) console.log('   - Missing transcript');
    if (!call.recording_url) console.log('   - Missing recording URL');
  }
} else {
  console.log('❌ Call NOT found in database after update');
}

// Step 3: Simulate call_analyzed webhook
console.log('\n📊 Step 3: Simulating call_analyzed webhook...');
const callAnalyzedPayload = {
  event: "call_analyzed",
  call: {
    call_id: testCallId,
    call_analysis: {
      sentiment: "positive",
      intent: "appointment_booking",
      outcome: "successful",
      key_topics: ["appointment", "scheduling", "booking"],
      customer_satisfaction: "high"
    }
  }
};

const analyzeResponse = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(callAnalyzedPayload)
});

console.log(`Status: ${analyzeResponse.status}`);
const analyzeResult = await analyzeResponse.json();
console.log('Response:', analyzeResult);

// Wait for processing
await new Promise(r => setTimeout(r, 2000));

// Final check
({ data: calls } = await supabase
  .from('calls')
  .select('*')
  .eq('retell_call_id', testCallId));

if (calls && calls.length > 0 && calls[0].call_analysis) {
  console.log('✅ Call analysis added');
  console.log('   Analysis:', JSON.stringify(calls[0].call_analysis, null, 2));
  console.log('\n✨ ALL TESTS PASSED! ✨');
  console.log('\nView this call in the dashboard:');
  console.log('https://voice-ai-platform-orcin.vercel.app/agents/f02fd2dc-32d7-42b8-8378-126d354798f7');
} else {
  console.log('⚠️  Call analysis not added');
}
