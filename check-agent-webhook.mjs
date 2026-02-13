import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const agent = await retell.agent.retrieve('agent_a5f4f85fae3d437567417811e6');
  
  console.log('Agent:', agent.agent_name);
  console.log('Webhook URL:', agent.webhook_url);
  console.log('Agent ID:', agent.agent_id);
} catch (error) {
  console.error('Error:', error.message);
}
