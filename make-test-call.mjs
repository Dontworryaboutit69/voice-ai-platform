import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n📞 Creating test web call for dental agent...\n');

const webCall = await retell.call.createWebCall({
  agent_id: dentalRetellAgentId,
  metadata: {
    agent_id: dentalAgentId,
    user_id: 'test-user',
    test_mode: 'true',
    prompt_version: '1'
  }
});

console.log('✅ Web call created!');
console.log(`Call ID: ${webCall.call_id}`);
console.log(`Access Token: ${webCall.access_token}`);
console.log(`\n💡 This call will appear in the dental agent's call history once completed.`);
