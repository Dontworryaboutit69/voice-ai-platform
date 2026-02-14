import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('🔍 Fetching recent Retell calls...\n');

try {
  const response = await retell.call.list({
    limit: 5,
    sort_order: 'descending'
  });

  console.log(`Found ${response.length} recent calls:\n`);

  response.forEach((call, idx) => {
    console.log(`Call ${idx + 1}:`);
    console.log('  Call ID:', call.call_id);
    console.log('  Agent ID:', call.agent_id);
    console.log('  Status:', call.call_status);
    console.log('  Start:', call.start_timestamp);
    console.log('  End:', call.end_timestamp || 'N/A');
    console.log('  From:', call.from_number);
    console.log('  To:', call.to_number);
    console.log('  Metadata:', JSON.stringify(call.metadata || {}));
    console.log('');
  });

} catch (error) {
  console.error('Error:', error.message);
}
