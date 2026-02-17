import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const PRODUCTION_URL = 'https://voice-ai-platform-orcin.vercel.app';
const RETELL_AGENT_ID = 'agent_fc977a82b680b6dfae4bfa7a15';
const DATABASE_AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7'; // Elite agent ID

async function verifyAndFixRetellConfig() {
  console.log('=== Verifying Retell Configuration ===\n');

  const retell = new Retell({ apiKey: RETELL_API_KEY });

  console.log('Checking agent:', RETELL_AGENT_ID);

  // Check Retell agent configuration
  const retellAgent = await retell.agent.retrieve(RETELL_AGENT_ID);

  console.log('\n=== Retell Agent Configuration ===');
  console.log('Webhook URL:', retellAgent.webhook_url);

  const webhookCorrect = retellAgent.webhook_url === `${PRODUCTION_URL}/api/webhooks/retell/call-events`;
  console.log(webhookCorrect ? '✅ Webhook URL is correct' : '❌ Webhook URL is WRONG');

  // Check LLM configuration
  if (retellAgent.response_engine?.type === 'retell-llm') {
    const llmId = (retellAgent.response_engine as any).llm_id;
    const llm = await retell.llm.retrieve(llmId);

    console.log('\n=== LLM Configuration ===');
    console.log('LLM ID:', llm.llm_id);
    console.log('Tools configured:', llm.general_tools?.length || 0);

    if (llm.general_tools && llm.general_tools.length > 0) {
      console.log('\n=== Tool URLs ===');
      let allCorrect = true;

      llm.general_tools.forEach((tool: any, i: number) => {
        const isCorrect = tool.url.startsWith(PRODUCTION_URL);
        console.log(`${i + 1}. ${tool.name}`);
        console.log(`   ${isCorrect ? '✅' : '❌'} ${tool.url}`);
        if (!isCorrect) allCorrect = false;
      });

      if (!allCorrect) {
        console.log('\n⚠️  PROBLEM: Tool URLs are pointing to wrong domain!');
        console.log('Expected domain:', PRODUCTION_URL);
        console.log('\n🔧 Fixing tool URLs...');

        // Fix tool URLs
        const updatedTools = llm.general_tools.map((tool: any) => {
          if (tool.url.includes('check-availability')) {
            return {
              ...tool,
              url: `${PRODUCTION_URL}/api/agents/${DATABASE_AGENT_ID}/check-availability`
            };
          } else if (tool.url.includes('book-appointment')) {
            return {
              ...tool,
              url: `${PRODUCTION_URL}/api/tools/book-appointment`
            };
          }
          return tool;
        });

        await retell.llm.update(llmId, {
          general_tools: updatedTools
        });

        console.log('✅ Tool URLs updated!');

        // Verify the fix
        const verifiedLlm = await retell.llm.retrieve(llmId);
        console.log('\n=== Verified Tool URLs ===');
        verifiedLlm.general_tools?.forEach((tool: any, i: number) => {
          console.log(`${i + 1}. ${tool.name}`);
          console.log(`   ✅ ${tool.url}`);
        });
      } else {
        console.log('\n✅ All tool URLs are correct!');
      }
    }
  }

  console.log('\n=== Final Status ===');
  console.log('✅ Ready for testing!');
  console.log('\nYou can now make a test call.');
}

verifyAndFixRetellConfig().catch(console.error);
