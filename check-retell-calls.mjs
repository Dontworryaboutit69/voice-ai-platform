import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

try {
  const calls = await retell.call.list({
    filter_agent_id: 'agent_a5f4f85fae3d437567417811e6',
    limit: 5,
    sort_order: 'descending'
  });
  
  console.log(`Found ${calls.length} calls`);
  calls.forEach((call, i) => {
    console.log(`\nCall ${i + 1}:`);
    console.log(`  ID: ${call.call_id}`);
    console.log(`  Status: ${call.call_status}`);
    console.log(`  Started: ${call.start_timestamp}`);
    console.log(`  Ended: ${call.end_timestamp || 'N/A'}`);
    console.log(`  Duration: ${call.call_duration_ms || call.duration_ms || 'N/A'}ms`);
    console.log(`  Has transcript: ${!!call.transcript}`);
    console.log(`  Has recording: ${!!call.recording_url}`);
  });
} catch (error) {
  console.error('Error:', error.message);
}
