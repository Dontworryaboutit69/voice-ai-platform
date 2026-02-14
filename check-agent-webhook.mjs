import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || 'key_f8ce139cda1b4ba8cc7c2faa7ac4'
});

console.log('🔍 Checking Retell agent webhook configuration...\n');

try {
  const agent = await retell.agent.retrieve('agent_562033eb10ac620d3ea30aa07f');

  console.log('Agent Details:');
  console.log('=============');
  console.log('Agent ID:', agent.agent_id);
  console.log('Agent Name:', agent.agent_name);
  console.log('Webhook URL:', agent.webhook_url || 'NOT SET');
  console.log('\n');

  if (!agent.webhook_url) {
    console.log('❌ PROBLEM: No webhook URL configured!');
    console.log('This is why calls are not appearing.');
  } else if (agent.webhook_url.includes('voice-ai-platform-orcin.vercel.app')) {
    console.log('✅ Webhook URL points to correct domain');
  } else {
    console.log('⚠️  WARNING: Webhook URL points to different location:');
    console.log('   Current:', agent.webhook_url);
    console.log('   Expected: https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events');
  }

} catch (error) {
  console.error('Error retrieving agent:', error.message);
}
