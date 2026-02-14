import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('🔍 Testing Retell webhook delivery...\n');

// Get the agent to verify webhook URL
const agent = await retell.agent.retrieve('agent_fc977a82b680b6dfae4bfa7a15');

console.log('Current Agent Webhook Configuration:');
console.log('====================================');
console.log('Agent ID:', agent.agent_id);
console.log('Agent Name:', agent.agent_name);
console.log('Webhook URL:', agent.webhook_url);
console.log('');

// Try to update it again to force Retell to re-verify
console.log('🔄 Re-setting webhook URL to force verification...');

try {
  const updated = await retell.agent.update('agent_fc977a82b680b6dfae4bfa7a15', {
    webhook_url: 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events'
  });
  
  console.log('✅ Webhook URL re-set successfully');
  console.log('');
  console.log('💡 Next Step: Make another test call to see if webhooks now work');
  
} catch (error) {
  console.error('❌ Error updating webhook:', error.message);
  if (error.message.includes('verification') || error.message.includes('unreachable')) {
    console.log('');
    console.log('🚨 Retell cannot reach the webhook endpoint!');
    console.log('This could mean:');
    console.log('  - The URL is not publicly accessible');
    console.log('  - Retell requires specific response format');
    console.log('  - SSL certificate issues');
  }
}
