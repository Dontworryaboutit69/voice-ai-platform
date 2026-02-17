import { createServiceClient } from '../lib/supabase/client';
import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

async function syncAgentName() {
  console.log('=== Syncing Agent Name ===\n');

  const supabase = createServiceClient();
  const retell = new Retell({ apiKey: RETELL_API_KEY });

  // Get the database agent
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, business_name, retell_agent_id')
    .eq('id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .single();

  if (error || !agent) {
    console.error('❌ Agent not found in database:', error);
    return;
  }

  console.log('Database Agent:');
  console.log('  ID:', agent.id);
  console.log('  Business Name:', agent.business_name);
  console.log('  Retell Agent ID:', agent.retell_agent_id);

  if (!agent.retell_agent_id) {
    console.error('❌ No Retell agent ID linked');
    return;
  }

  // Get current Retell agent name
  const retellAgent = await retell.agent.retrieve(agent.retell_agent_id);
  console.log('\nRetell Agent:');
  console.log('  Current Name:', retellAgent.agent_name);
  console.log('  Expected Name:', agent.business_name);

  if (retellAgent.agent_name !== agent.business_name) {
    console.log('\n❌ MISMATCH! Updating Retell agent name...');

    await retell.agent.update(agent.retell_agent_id, {
      agent_name: agent.business_name
    });

    console.log('✅ Retell agent name updated to:', agent.business_name);
  } else {
    console.log('\n✅ Names already match!');
  }
}

syncAgentName();
