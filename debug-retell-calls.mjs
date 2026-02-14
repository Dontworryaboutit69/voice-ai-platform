import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

// Read .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const retell = new Retell({
  apiKey: envVars.RETELL_API_KEY,
});

console.log('\n=== Fetching Calls for Dental Agent ===');
console.log('Retell Agent ID: agent_fc977a82b680b6dfae4bfa7a15\n');

// Fetch calls filtered by dental agent
const callsList = await retell.call.list({
  filter_agent_id: 'agent_fc977a82b680b6dfae4bfa7a15',
  limit: 10,
  sort_order: 'descending'
});

console.log(`Total calls returned: ${callsList.length}\n`);

callsList.forEach((call, idx) => {
  console.log(`--- Call ${idx + 1} ---`);
  console.log(`Call ID: ${call.call_id}`);
  console.log(`Agent ID: ${call.agent_id}`);
  console.log(`From: ${call.from_number} → To: ${call.to_number}`);
  console.log(`Started: ${call.start_timestamp}`);
  console.log(`Metadata:`, call.metadata);
  console.log('');
});
