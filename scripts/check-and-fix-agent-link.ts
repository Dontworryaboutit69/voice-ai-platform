import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const DATABASE_AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const CORRECT_RETELL_AGENT_ID = 'agent_fc977a82b680b6dfae4bfa7a15';
const CORRECT_RETELL_LLM_ID = 'llm_5207418a1ed54bfea280a26bc2fd';

async function checkAndFixAgentLink() {
  console.log('=== Checking Database Agent ===\n');

  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, business_name, retell_agent_id, retell_llm_id')
    .eq('id', DATABASE_AGENT_ID)
    .single();

  if (error || !agent) {
    console.error('❌ Agent not found in database:', error);
    return;
  }

  console.log('Database Agent ID:', agent.id);
  console.log('Business Name:', agent.business_name);
  console.log('Current Retell Agent ID:', agent.retell_agent_id);
  console.log('Current Retell LLM ID:', agent.retell_llm_id);

  console.log('\n=== Expected Values ===');
  console.log('Retell Agent ID should be:', CORRECT_RETELL_AGENT_ID);
  console.log('Retell LLM ID should be:', CORRECT_RETELL_LLM_ID);

  if (agent.retell_agent_id !== CORRECT_RETELL_AGENT_ID || agent.retell_llm_id !== CORRECT_RETELL_LLM_ID) {
    console.log('\n❌ MISMATCH DETECTED! Fixing...');

    const { error: updateError } = await supabase
      .from('agents')
      .update({
        retell_agent_id: CORRECT_RETELL_AGENT_ID,
        retell_llm_id: CORRECT_RETELL_LLM_ID,
        updated_at: new Date().toISOString()
      })
      .eq('id', DATABASE_AGENT_ID);

    if (updateError) {
      console.error('❌ Failed to update:', updateError);
      return;
    }

    console.log('✅ Database updated!');

    // Verify
    const { data: verified } = await supabase
      .from('agents')
      .select('retell_agent_id, retell_llm_id')
      .eq('id', DATABASE_AGENT_ID)
      .single();

    console.log('\n=== Verified ===');
    console.log('Retell Agent ID:', verified?.retell_agent_id);
    console.log('Retell LLM ID:', verified?.retell_llm_id);
  } else {
    console.log('\n✅ Database is already correct!');
  }
}

checkAndFixAgentLink();
