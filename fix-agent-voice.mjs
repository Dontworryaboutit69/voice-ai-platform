import { createClient } from '@supabase/supabase-js';
import Retell from 'retell-sdk';
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

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const retellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';
const newVoiceId = '11labs-Cimo';

console.log('\n🔧 Fixing agent voice...\n');

// 1. Update database
console.log('1. Updating database...');
await supabase
  .from('agents')
  .update({ voice_id: newVoiceId })
  .eq('id', dentalAgentId);
console.log(`   ✅ Database updated to ${newVoiceId}`);

// 2. Update Retell agent
console.log('\n2. Updating Retell agent...');
try {
  await retell.agent.update(retellAgentId, {
    voice_id: newVoiceId
  });
  console.log(`   ✅ Retell agent updated to ${newVoiceId}`);
} catch (error) {
  console.error(`   ❌ Error: ${error.message}`);
}

// 3. Verify
console.log('\n3. Verifying...');
const agent = await retell.agent.retrieve(retellAgentId);
console.log(`   Database voice: ${newVoiceId}`);
console.log(`   Retell voice: ${agent.voice_id}`);

if (agent.voice_id === newVoiceId) {
  console.log('\n✅ SUCCESS! Voice is synced correctly');
} else {
  console.log('\n❌ MISMATCH! Voice sync failed');
}
