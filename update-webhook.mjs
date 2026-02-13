import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const result = await retell.agent.update('agent_a5f4f85fae3d437567417811e6', {
    webhook_url: 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events'
  });

  console.log('✅ Webhook URL updated successfully!');
  console.log('Agent:', result.agent_name);
  console.log('New webhook URL:', result.webhook_url);
} catch (error) {
  console.error('❌ Error:', error.message);
}
