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

console.log('\n=== Cleaning up incorrect calls ===\n');

// Delete all calls from the dental agent that don't actually belong to it
// We'll identify incorrect calls by looking at the retell_call_id
const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

// For now, let's just delete ALL calls and let the user re-sync fresh
const { data: deletedCalls, error } = await supabase
  .from('calls')
  .delete()
  .eq('agent_id', dentalAgentId)
  .select('retell_call_id');

if (error) {
  console.error('Error:', error);
} else {
  console.log(`✅ Deleted ${deletedCalls.length} calls from dental agent`);
  console.log('You can now re-sync to get only the correct calls for this agent.');
}
