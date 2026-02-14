import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('🔍 Checking if Retell has webhook event logs...\n');

// Get the most recent call
const calls = await retell.call.list({ limit: 1, sort_order: 'descending' });
const latestCall = calls[0];

console.log('Latest Call:', latestCall.call_id);
console.log('Agent:', latestCall.agent_id);
console.log('Status:', latestCall.call_status);
console.log('');

// Check agent webhook configuration one more time
const agent = await retell.agent.retrieve(latestCall.agent_id);
console.log('Agent Webhook URL:', agent.webhook_url);
console.log('');

if (!agent.webhook_url || !agent.webhook_url.includes('voice-ai-platform-orcin.vercel.app')) {
  console.log('❌ FOUND THE PROBLEM!');
  console.log('The agent you called does NOT have the webhook URL set!');
  console.log('');
  console.log('Setting webhook now...');
  
  await retell.agent.update(latestCall.agent_id, {
    webhook_url: 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events'
  });
  
  console.log('✅ Webhook URL updated');
  console.log('Make another test call to verify it works now.');
} else {
  console.log('✅ Webhook URL is correctly configured');
  console.log('');
  console.log('⚠️  But webhooks are still not being delivered.');
  console.log('');
  console.log('Possible causes:');
  console.log('1. Retell webhook system has a delay');
  console.log('2. Webhook URL needs HTTPS with valid SSL');
  console.log('3. Retell expects specific response headers');
  console.log('4. There may be a Retell service issue');
}
