import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

console.log('\n🔄 Testing sync endpoint with detailed logging...\n');

const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/sync-calls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentId: dentalAgentId })
});

const data = await response.json();

console.log('Status:', response.status);
console.log('Response:', JSON.stringify(data, null, 2));

if (data.success) {
  console.log(`\n✅ Synced ${data.syncedCount} new calls`);
  console.log(`📝 Updated ${data.updatedCount} existing calls`);
  console.log(`❌ Skipped ${data.skippedCount} calls from other agents`);
  console.log(`📊 Total processed: ${data.totalProcessed}`);
} else {
  console.log('\n❌ Sync failed:', data.error);
}
