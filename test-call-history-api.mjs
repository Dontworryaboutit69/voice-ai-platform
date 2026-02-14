const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

console.log('\n📞 Testing Call History API...\n');

const response = await fetch(`https://voice-ai-platform-orcin.vercel.app/api/agents/${dentalAgentId}/calls`);
const data = await response.json();

console.log('Status:', response.status);
console.log('Total calls returned:', data.calls?.length || 0);
console.log('\nFirst 5 calls:');
data.calls?.slice(0, 5).forEach((call, i) => {
  console.log(`\n${i + 1}. ${call.retell_call_id}`);
  console.log(`   Status: ${call.call_status}`);
  console.log(`   Started: ${call.started_at}`);
  console.log(`   Duration: ${call.duration_ms ? Math.round(call.duration_ms / 1000) + 's' : 'N/A'}`);
  console.log(`   Has transcript: ${call.transcript ? 'YES' : 'NO'}`);
});
