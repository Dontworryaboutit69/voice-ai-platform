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

const callsList = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 5,
  sort_order: 'descending'
});

const dentalCall = callsList.find(c => c.agent_id === dentalRetellAgentId);

console.log('\n📦 Full call object structure:\n');
console.log(JSON.stringify(dentalCall, null, 2));
