import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const PRODUCTION_URL = 'https://voice-ai-platform-orcin.vercel.app';
const AGENT_ID = 'agent_fc977a82b680b6dfae4bfa7a15';

async function fixWebhookUrl() {
  const retell = new Retell({ apiKey: RETELL_API_KEY });

  console.log('Fixing webhook URL for agent:', AGENT_ID);

  await retell.agent.update(AGENT_ID, {
    webhook_url: `${PRODUCTION_URL}/api/webhooks/retell/call-events`
  });

  console.log('✅ Webhook URL fixed!');

  // Verify
  const agent = await retell.agent.retrieve(AGENT_ID);
  console.log('Verified webhook:', agent.webhook_url);
}

fixWebhookUrl();
