import 'dotenv/config';

const WEBHOOK_URL = 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function testWebhook() {
  console.log('=== Testing Webhook Manually ===\n');

  const payload = {
    event: 'call_ended',
    call: {
      call_id: 'test_manual_' + Date.now(),
      duration_ms: 60000,
      transcript: 'Customer: Hi I need a dentist. Agent: What is your name? Customer: John Smith. Agent: What is your phone number? Customer: 555-1234.',
      transcript_object: [
        { role: 'user', content: 'Hi I need a dentist' },
        { role: 'agent', content: 'What is your name?' },
        { role: 'user', content: 'John Smith' },
        { role: 'agent', content: 'What is your phone number?' },
        { role: 'user', content: '555-1234' }
      ],
      recording_url: 'https://example.com/recording.mp3',
      end_timestamp: new Date().toISOString(),
      from_number: '+15551234567',
      to_number: '+15559876543'
    },
    metadata: {
      agent_id: AGENT_ID
    }
  };

  console.log('Sending webhook to:', WEBHOOK_URL);
  console.log('Agent ID:', AGENT_ID);
  console.log('\nPayload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('\nResponse status:', response.status);
    const result = await response.json();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('\n✅ Webhook accepted!');
      console.log('\nNow check:');
      console.log('1. Database calls table for new test call');
      console.log('2. integration_sync_logs for sync attempts');
      console.log('3. GoHighLevel for new contact');
    } else {
      console.log('\n❌ Webhook failed!');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

testWebhook().catch(console.error);
