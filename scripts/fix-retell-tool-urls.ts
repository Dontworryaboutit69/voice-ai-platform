import 'dotenv/config';
import Retell from 'retell-sdk';
import { createServiceClient } from '../lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const PRODUCTION_URL = 'https://voice-ai-platform-orcin.vercel.app';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function fixRetellToolUrls() {
  console.log('=== Fixing Retell Tool URLs ===\n');

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
    console.log(`  - ${tool.name}: ${tool.url}`);
  });

  // 3. Update tool URLs
  const updatedTools = llm.general_tools?.map((tool: any) => {
    if (tool.name === 'check_calendar_availability') {
      return {
        ...tool,
        url: `${PRODUCTION_URL}/api/agents/${AGENT_ID}/check-availability`
      };
    } else if (tool.name === 'book_appointment') {
      return {
        ...tool,
        url: `${PRODUCTION_URL}/api/tools/book-appointment`
      };
    }
    return tool;
  });

  await retell.llm.update(agent.retell_llm_id, {
    general_tools: updatedTools
  });

  console.log('\n✅ Tool URLs updated to production domain!');
  console.log('\nNew tools:');
  updatedTools?.forEach((tool: any) => {
    console.log(`  - ${tool.name}: ${tool.url}`);
  });
}

fixRetellToolUrls().catch(console.error);
