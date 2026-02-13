import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const calls = await retell.call.list({
    filter_agent_id: 'agent_a5f4f85fae3d437567417811e6',
    limit: 1,
    sort_order: 'descending'
  });
  
  if (calls.length > 0) {
    const call = calls[0];
    const startTime = new Date(parseInt(call.start_timestamp));
    const endTime = call.end_timestamp ? new Date(parseInt(call.end_timestamp)) : null;
    
    console.log('Most recent call in Retell:');
    console.log('  ID:', call.call_id);
    console.log('  Status:', call.call_status);
    console.log('  Started:', startTime.toISOString());
    console.log('  Ended:', endTime ? endTime.toISOString() : 'Still in progress');
    console.log('  Duration:', call.call_duration_ms || call.duration_ms || 'N/A', 'ms');
  } else {
    console.log('No calls found');
  }
} catch (error) {
  console.error('Error:', error.message);
}
