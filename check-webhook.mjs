import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

const dentalRetellAgentId = 'agent_fc977a82b680b6dfae4bfa7a15';

console.log('\n🔗 Checking Retell agent webhook configuration...\n');

const agent = await retell.agent.retrieve(dentalRetellAgentId);

console.log('Agent Name:', agent.agent_name);
console.log('Agent ID:', agent.agent_id);
console.log('Webhook URL:', agent.webhook_url || 'NOT SET');
console.log('\nExpected webhook URL:');
console.log('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/call-events');

if (!agent.webhook_url) {
  console.log('\n❌ PROBLEM: Webhook URL is not configured!');
  console.log('This is why calls are not being stored in the database.');
} else if (!agent.webhook_url.includes('voice-ai-platform-orcin.vercel.app')) {
  console.log('\n⚠️  WARNING: Webhook URL points to wrong domain!');
  console.log('Calls are being sent to:', agent.webhook_url);
}

// Check recent calls
console.log('\n📞 Recent calls from Retell:\n');
const calls = await retell.call.list({
  filter_agent_id: dentalRetellAgentId,
  limit: 5,
  sort_order: 'descending'
});

calls.forEach(call => {
  console.log(`- ${call.call_id}`);
  console.log(`  Started: ${new Date(call.start_timestamp).toISOString()}`);
  console.log(`  Status: ${call.call_status}`);
  console.log('');
});
