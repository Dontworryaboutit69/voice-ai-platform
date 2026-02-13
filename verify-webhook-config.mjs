import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const agent = await retell.agent.retrieve('agent_a5f4f85fae3d437567417811e6');
  
  console.log('=== Current Retell Agent Configuration ===');
  console.log('Webhook URL:', agent.webhook_url);
  
  const calls = await retell.call.list({
    filter_agent_id: 'agent_a5f4f85fae3d437567417811e6',
    limit: 1,
    sort_order: 'descending'
  });
  
  if (calls.length > 0) {
    const call = calls[0];
    console.log('\n=== Most Recent Call ===');
    console.log('Call ID:', call.call_id);
    console.log('Agent ID used for call:', call.agent_id);
    console.log('Expected agent ID:', agent.agent_id);
    console.log('Match:', call.agent_id === agent.agent_id ? '✅ YES' : '❌ NO');
  }
} catch (error) {
  console.error('Error:', error.message);
}
