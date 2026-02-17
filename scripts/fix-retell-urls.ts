import 'dotenv/config';
import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const PRODUCTION_URL = 'https://voice-ai-platform-orcin.vercel.app';
const RETELL_AGENT_ID = 'agent_fc977a82b680b6dfae4bfa7a15';
const RETELL_LLM_ID = 'llm_5207418a1ed54bfea280a26bc2fd';
const DATABASE_AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function fixRetellUrls() {
  console.log('=== Fixing Retell URLs ===\n');

  const retell = new Retell({ apiKey: RETELL_API_KEY });

  // 1. Fix Agent Webhook URL (remove newline)
  console.log('1. Fixing agent webhook URL...');
  await retell.agent.update(RETELL_AGENT_ID, {
    webhook_url: `${PRODUCTION_URL}/api/webhooks/retell/call-events`
  });
  console.log('   ✓ Agent webhook URL updated\n');

  // 2. Fix LLM Tool URLs
  console.log('2. Fixing LLM tool URLs...');
  const llm = await retell.llm.retrieve(RETELL_LLM_ID);

  const updatedTools = llm.general_tools?.map((tool: any) => {
    if (tool.name === 'check_calendar_availability') {
      return {
        ...tool,
        url: `${PRODUCTION_URL}/api/agents/${DATABASE_AGENT_ID}/check-availability`
      };
    } else if (tool.name === 'book_appointment') {
      return {
        ...tool,
        url: `${PRODUCTION_URL}/api/tools/book-appointment`
      };
    }
    return tool;
  });

  await retell.llm.update(RETELL_LLM_ID, {
    general_tools: updatedTools
  });
  console.log('   ✓ LLM tool URLs updated\n');

  // 3. Verify changes
  console.log('3. Verifying changes...');
  const verifiedAgent = await retell.agent.retrieve(RETELL_AGENT_ID);
  const verifiedLlm = await retell.llm.retrieve(RETELL_LLM_ID);

  console.log('\nAgent Webhook URL:', verifiedAgent.webhook_url);
  console.log('\nTool URLs:');
  verifiedLlm.general_tools?.forEach((tool: any) => {
    console.log(`  - ${tool.name}: ${tool.url}`);
  });

  console.log('\n✅ All URLs fixed and verified!');
}

fixRetellUrls().catch(console.error);
