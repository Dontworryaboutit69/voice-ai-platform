require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  // Get all prompt versions for Elite Dental
  const { data: versions } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .order('version_number', { ascending: false });

  console.log('Available versions:');
  versions.forEach(v => {
    console.log(`v${v.version_number}: ${v.generation_method} - Created: ${v.created_at}`);
  });

  // Find the version BEFORE AI Manager suggestions
  // Look for the last version that's NOT auto_improved
  const goodVersion = versions.find(v =>
    v.generation_method !== 'auto_improved'
  );

  console.log(`\nRolling back to version ${goodVersion.version_number}...`);

  // Update agent's current_prompt_id to the good version
  await supabase
    .from('agents')
    .update({ current_prompt_id: goodVersion.id })
    .eq('id', 'f02fd2dc-32d7-42b8-8378-126d354798f7');

  console.log(`✅ Rolled back agent to version ${goodVersion.version_number}`);
  console.log(`   Method: ${goodVersion.generation_method}`);
  console.log(`   Created: ${goodVersion.created_at}`);

  console.log('\n⚠️  IMPORTANT: Make a test call to update Retell with the old prompt');
})();
