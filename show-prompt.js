const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function showPrompt() {
  const { data, error } = await supabase
    .from('prompt_versions')
    .select('compiled_prompt, prompt_knowledge')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== COMPILED PROMPT (first 3000 chars) ===');
  console.log(data.compiled_prompt.substring(0, 3000));
  console.log('\n\n=== KNOWLEDGE BASE ===');
  console.log(data.prompt_knowledge || 'No knowledge base');
}

showPrompt();
