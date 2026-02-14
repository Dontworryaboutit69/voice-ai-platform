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

console.log('\n🔧 Retell Agent Configuration:\n');
console.log('Agent Name:', agent.agent_name);
console.log('Voice ID:', agent.voice_id);
console.log('Language:', agent.language);
console.log('LLM ID:', agent.response_engine?.llm_id);

// Also check the LLM
if (agent.response_engine?.llm_id) {
  const llm = await retell.llm.retrieve(agent.response_engine.llm_id);
  console.log('\n🧠 LLM Configuration:');
  console.log('Model:', llm.model);
  console.log('Begin Message:', llm.begin_message?.substring(0, 50) + '...');
}
