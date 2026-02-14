import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });
const retellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

const agent = await retell.agent.retrieve(retellAgentId);

console.log('\n🎙️ Current Retell Agent Voice:');
console.log('Voice ID:', agent.voice_id);
console.log('Agent Name:', agent.agent_name);

if (agent.voice_id === '11labs-Billy') {
  console.log('\n✅ SUCCESS! Billy is now the active voice!');
} else {
  console.log(`\n⚠️  Voice is still: ${agent.voice_id}`);
}
