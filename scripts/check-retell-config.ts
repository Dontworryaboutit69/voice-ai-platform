import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

async function checkRetellConfig() {
  const retell = new Retell({ apiKey: RETELL_API_KEY });

  // Get the Elite agent's Retell agent
  const agent = await retell.agent.retrieve('agent_a5f4f85fae3d437567417811e6');

  console.log('\n=== Retell Agent Configuration ===');
  console.log('Agent ID:', agent.agent_id);
  console.log('Agent Name:', agent.agent_name);
  console.log('Webhook URL:', agent.webhook_url);
  console.log('\nLLM Config:', agent.llm_websocket_url || agent.response_engine);

  if (agent.response_engine?.type === 'retell-llm') {
    const llmId = (agent.response_engine as any).llm_id;
    console.log('\nFetching LLM details...');
    const llm = await retell.llm.retrieve(llmId);
    console.log('LLM ID:', llm.llm_id);
    console.log('Model:', llm.model);
    console.log('Tools configured:', llm.general_tools?.length || 0);

    if (llm.general_tools && llm.general_tools.length > 0) {
      console.log('\n=== Tool URLs ===');
      llm.general_tools.forEach((tool: any, i: number) => {
        console.log(`Tool ${i + 1}: ${tool.name}`);
        console.log(`  URL: ${tool.url}`);
      });
    }
  }
}

checkRetellConfig();
