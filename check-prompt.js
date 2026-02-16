require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: agent } = await supabase
    .from('agents')
    .select('current_prompt_id')
    .eq('id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .single();

  const { data: prompt } = await supabase
    .from('prompt_versions')
    .select('compiled_prompt')
    .eq('id', agent.current_prompt_id)
    .single();

  console.log(prompt.compiled_prompt);
})();
