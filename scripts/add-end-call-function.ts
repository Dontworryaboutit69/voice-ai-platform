import 'dotenv/config';
import Retell from 'retell-sdk';
import { createServiceClient } from '../lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function addEndCallFunction() {
  console.log('=== Adding end_call Function to Agent ===\n');

  const retell = new Retell({ apiKey: RETELL_API_KEY });
  const supabase = createServiceClient();

  // 1. Get agent from database
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('retell_agent_id, retell_llm_id')
    .eq('id', AGENT_ID)
    .single();

  if (agentError || !agent) {
    console.error('❌ Agent not found:', agentError);
    return;
  }

  console.log('Agent:', agent);

  // 2. Get current LLM configuration
  const llm = await retell.llm.retrieve(agent.retell_llm_id);
  console.log('\nCurrent tools:');
  llm.general_tools?.forEach((tool: any) => {
    console.log(`  - ${tool.name}`);
  });

  // 3. Add end_call function
  const endCallFunction = {
    type: 'end_call' as const,
    name: 'end_call',
    description: 'End the call when the conversation is complete or the customer says goodbye/bye/thanks/that\'s all'
  };

  const updatedTools = [
    ...(llm.general_tools || []),
    endCallFunction
  ];

  // 4. Update LLM with new tools
  await retell.llm.update(agent.retell_llm_id, {
    general_tools: updatedTools
  });

  console.log('\n✅ end_call function added!');
  console.log('\nUpdated tools:');
  updatedTools.forEach((tool: any) => {
    console.log(`  - ${tool.name}`);
  });
}

addEndCallFunction().catch(console.error);
