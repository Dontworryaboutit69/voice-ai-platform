import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n📞 Recent calls from Retell for dental agent:\n');

const calls = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 10,
  sort_order: 'descending'
});

console.log(`Total: ${calls.length} calls\n`);

calls.forEach((call, idx) => {
  const belongsToDental = call.agent_id === dentalRetellAgentId;
  const marker = belongsToDental ? '✅ DENTAL' : '❌ OTHER';
  
  console.log(`${idx + 1}. ${marker} - ${call.call_id}`);
  console.log(`   Agent: ${call.agent_id}`);
  console.log(`   Status: ${call.call_status}`);
  console.log(`   Started: ${new Date(call.start_timestamp).toISOString()}`);
  console.log(`   Ended: ${call.end_timestamp ? new Date(call.end_timestamp).toISOString() : 'N/A'}`);
  console.log(`   Metadata: ${JSON.stringify(call.metadata)}`);
  console.log('');
});
