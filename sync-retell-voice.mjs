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

console.log('\n🔧 Updating Retell agent to 11labs-Sarah...\n');

try {
  await retell.agent.update(retellAgentId, {
    voice_id: '11labs-Sarah'
  });
  
  console.log('✅ Update sent to Retell');
  
  // Verify update
  const agent = await retell.agent.retrieve(retellAgentId);
  console.log('\n📋 Verified Retell agent config:');
  console.log('Voice ID:', agent.voice_id);
  console.log('Agent Name:', agent.agent_name);
} catch (error) {
  console.error('❌ Error updating Retell agent:', error.message);
}
