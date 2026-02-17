import { createServiceClient } from '../lib/supabase/client';
import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

async function fixAgentIds() {
  console.log('Fixing agent IDs...');

  const supabase = createServiceClient();
  const retell = new Retell({ apiKey: RETELL_API_KEY });

  // Get Elite agent from database
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .ilike('business_name', '%Elite%')
    .single();

  if (!agent) {
    console.error('Elite agent not found');
    return;
  }

  console.log('Found agent:', agent.business_name, agent.id);

  // Use the CORRECT Retell agent with correct webhook URL
  const workingAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';
  const llmId = 'llm_5207418a1ed54bfea280a26bc2fd';

  console.log(`\nUsing Retell agent: ${workingAgentId}`);

  // Get the agent details from Retell
  try {
    const retellAgent = await retell.agent.retrieve(workingAgentId);
    console.log('Retell agent details:');
    console.log('  Name:', retellAgent.agent_name);
    console.log('  Voice:', retellAgent.voice_id);
    console.log('  Webhook:', retellAgent.webhook_url);
    console.log('  LLM ID:', retellAgent.llm_websocket_url ? 'Custom' : retellAgent.response_engine);

    // Update database with this agent ID AND LLM ID
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        retell_agent_id: workingAgentId,
        retell_llm_id: llmId,
        updated_at: new Date().toISOString()
      })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Failed to update database:', updateError);
    } else {
      console.log('\n✅ Updated database with Retell agent ID');
    }

    // Update the Retell agent to use Elite's name
    await retell.agent.update(workingAgentId, {
      agent_name: agent.business_name,
      webhook_url: 'https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events'
    });

    console.log('✅ Updated Retell agent name and webhook URL');

  } catch (error: any) {
    console.error('Error:', error.message);
  }

  console.log('\n✅ Fix complete!');
  console.log('\nNow:');
  console.log('1. Make a test call');
  console.log('2. Check if call appears in database');
  console.log('3. Verify GHL contact is created');
}

fixAgentIds();
