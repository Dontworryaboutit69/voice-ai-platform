import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
);

console.log('🔍 Checking database agent configuration...\n');

const { data: agent } = await supabase
  .from('agents')
  .select('*')
  .eq('id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
  .single();

console.log('Database Agent:');
console.log('==============');
console.log('ID:', agent.id);
console.log('Name:', agent.business_name);
console.log('Retell Agent ID:', agent.retell_agent_id);
console.log('');

console.log('⚠️  PROBLEM FOUND:');
console.log('Database has:', agent.retell_agent_id);
console.log('Your test used: agent_fc977a82b680b6dfae4bfa7a15');
console.log('');
console.log('This mismatch is why webhooks are not working!');
