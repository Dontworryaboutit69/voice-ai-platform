import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

console.log('\n🎯 Complete Call Flow Test\n');
console.log('=' .repeat(50));

// Step 1: Get current call count
console.log('\n📊 STEP 1: Checking current call count...');
let response = await fetch(`https://voice-ai-platform-orcin.vercel.app/api/agents/${dentalAgentId}/calls`);
let data = await response.json();
const beforeCount = data.calls?.length || 0;
console.log(`   Current calls in database: ${beforeCount}`);

// Step 2: Manual instruction for user
console.log('\n🎤 STEP 2: User Action Required');
console.log('   Please make a test call now using the Voice Test feature');
console.log('   in the platform at:');
console.log('   https://voice-ai-platform-orcin.vercel.app/agents/' + dentalAgentId);
console.log('\n   When done, press Enter to continue...');

// Wait for user input
await new Promise(resolve => {
  process.stdin.once('data', resolve);
});

// Step 3: Wait a moment for sync
console.log('\n⏳ STEP 3: Waiting 3 seconds for auto-sync...');
await new Promise(r => setTimeout(r, 3000));

// Step 4: Force sync
console.log('\n🔄 STEP 4: Running manual sync...');
response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/sync-calls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentId: dentalAgentId })
});
data = await response.json();
console.log(`   Synced: ${data.syncedCount} new, ${data.updatedCount} updated`);

// Step 5: Check updated call count
console.log('\n📊 STEP 5: Checking updated call count...');
response = await fetch(`https://voice-ai-platform-orcin.vercel.app/api/agents/${dentalAgentId}/calls`);
data = await response.json();
const afterCount = data.calls?.length || 0;
console.log(`   Calls after sync: ${afterCount}`);
console.log(`   New calls: ${afterCount - beforeCount}`);

if (afterCount > beforeCount) {
  console.log('\n✅ SUCCESS! New call appeared in Call History');
  console.log('\nMost recent call:');
  const latest = data.calls[0];
  console.log(`   ID: ${latest.retell_call_id}`);
  console.log(`   Status: ${latest.call_status}`);
  console.log(`   Started: ${latest.started_at}`);
  console.log(`   Duration: ${latest.duration_ms ? Math.round(latest.duration_ms / 1000) + 's' : 'N/A'}`);
} else {
  console.log('\n⚠️  No new call detected. The call might still be processing.');
}

console.log('\n' + '='.repeat(50));
