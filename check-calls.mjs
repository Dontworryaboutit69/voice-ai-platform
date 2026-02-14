import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

// Get all calls and show their agent_ids
const { data: calls, error } = await supabase
  .from('calls')
  .select('id, retell_call_id, agent_id, from_number, to_number, started_at')
  .order('started_at', { ascending: false })
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log('\n=== Recent Calls ===\n');
  calls.forEach(call => {
    console.log(`Call ID: ${call.retell_call_id}`);
    console.log(`Agent ID: ${call.agent_id}`);
    console.log(`From: ${call.from_number} → To: ${call.to_number}`);
    console.log(`Started: ${call.started_at}`);
    console.log('---');
  });
}

// Check what agent_id the dental agent should have
console.log('\n=== Agents ===\n');
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, retell_agent_id')
  .order('created_at', { ascending: false })
  .limit(5);

agents.forEach(agent => {
  console.log(`Name: ${agent.name}`);
  console.log(`Agent ID (our DB): ${agent.id}`);
  console.log(`Retell Agent ID: ${agent.retell_agent_id}`);
  console.log('---');
});
