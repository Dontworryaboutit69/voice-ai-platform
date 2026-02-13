import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const agent = await retell.agent.retrieve('agent_562033eb10ac620d3ea30aa07f');
  
  console.log('=== Current Agent Configuration ===');
  console.log('Agent ID:', agent.agent_id);
  console.log('Agent Name:', agent.agent_name);
  console.log('Webhook URL:', agent.webhook_url);
  console.log('\n=== Recent Calls for This Agent ===');
  
  const calls = await retell.call.list({
    filter_agent_id: 'agent_562033eb10ac620d3ea30aa07f',
    limit: 5,
    sort_order: 'descending'
  });
  
  console.log(`Found ${calls.length} calls`);
  calls.forEach((call, i) => {
    console.log(`\nCall ${i + 1}:`);
    console.log('  Call ID:', call.call_id);
    console.log('  Status:', call.call_status);
    console.log('  Start:', call.start_timestamp ? new Date(parseInt(call.start_timestamp)).toISOString() : 'N/A');
    console.log('  End:', call.end_timestamp ? new Date(parseInt(call.end_timestamp)).toISOString() : 'N/A');
  });
  
} catch (error) {
  console.error('Error:', error.message);
}
