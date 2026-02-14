import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const { data: agent } = await supabase
  .from('agents')
  .select('id, business_name, voice_id, retell_agent_id, retell_llm_id')
  .eq('id', dentalAgentId)
  .single();

console.log('\n📊 Agent Settings in Database:\n');
console.log('Business Name:', agent.business_name);
console.log('Voice ID:', agent.voice_id || '(not set)');
console.log('Retell Agent ID:', agent.retell_agent_id);
console.log('Retell LLM ID:', agent.retell_llm_id || '(not set)');
