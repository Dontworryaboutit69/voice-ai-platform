import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

const testCallAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('🔍 Checking agent from your test call...\n');

try {
  const agent = await retell.agent.retrieve(testCallAgentId);

  console.log('Agent Details:');
  console.log('=============');
  console.log('Agent ID:', agent.agent_id);
  console.log('Agent Name:', agent.agent_name);
  console.log('Current Webhook URL:', agent.webhook_url || 'NOT SET');
  console.log('');

  // Update webhook
  console.log('📝 Updating webhook URL...');
  const updated = await retell.agent.update(testCallAgentId, {
    webhook_url: 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events'
  });

  console.log('✅ Webhook updated successfully!');
  console.log('New Webhook URL:', updated.webhook_url);
  console.log('');
  console.log('⚠️  IMPORTANT: Update database with correct agent ID');
  console.log(`   Agent ID to use: ${testCallAgentId}`);

} catch (error) {
  console.error('Error:', error.message);
}
