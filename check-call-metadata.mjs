import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

// Check the most recent call
const callId = 'call_884bf744c3c1113adc73aea6b14';

console.log('\n🔍 Checking call details from Retell...\n');

const call = await retell.call.retrieve(callId);

console.log('Call ID:', call.call_id);
console.log('Agent ID:', call.agent_id);
console.log('Status:', call.call_status);
console.log('Started:', new Date(call.start_timestamp).toISOString());
console.log('Ended:', call.end_timestamp ? new Date(call.end_timestamp).toISOString() : 'N/A');
console.log('Metadata:', call.metadata);
console.log('From:', call.from_number);
console.log('To:', call.to_number);
