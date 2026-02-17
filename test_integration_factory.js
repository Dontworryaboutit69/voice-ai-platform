require('dotenv').config({ path: '.env.local' });

async function testIntegrationFactory() {
  // Dynamically import ES module
  const { processCallThroughIntegrations } = await import('./lib/integrations/integration-factory.js');
  
  const agentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
  const testCallData = {
    callId: 'test-123',
    agentId: agentId,
    customerName: 'Test User',
    customerPhone: '+1234567890',
    customerEmail: 'test@example.com',
    callOutcome: 'message_taken',
    callSummary: 'Test call',
    callSentiment: 'neutral',
    transcript: 'Test transcript',
    recordingUrl: null,
    startedAt: new Date(),
    endedAt: new Date(),
    durationSeconds: 60
  };

  console.log('Testing integration factory...');
  await processCallThroughIntegrations(agentId, testCallData);
  console.log('Done!');
}

testIntegrationFactory().catch(console.error);
