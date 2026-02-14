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

// Get one call to see all available columns
const { data: sampleCall } = await supabase
  .from('calls')
  .select('*')
  .limit(1)
  .single();

console.log('\n📋 Available columns in calls table:\n');
if (sampleCall) {
  Object.keys(sampleCall).forEach(col => console.log(`  - ${col}`));
} else {
  console.log('No calls found, checking with insert attempt...');
  
  const { error } = await supabase
    .from('calls')
    .insert({
      retell_call_id: 'test_' + Date.now(),
      agent_id: 'test'
    });
    
  console.log('Insert error:', error?.message);
  console.log('Error details:', error?.details);
}
