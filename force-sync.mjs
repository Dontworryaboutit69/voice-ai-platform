import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

console.log('\n🔄 Force syncing calls from Retell...\n');

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
  
  // Check database again
  await new Promise(r => setTimeout(r, 2000));
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: calls } = await supabase
    .from('calls')
    .select('retell_call_id, call_status, started_at')
    .eq('agent_id', dentalAgentId)
    .order('started_at', { ascending: false })
    .limit(5);
    
  console.log(`\n🗄️  Latest 5 calls in database:\n`);
  calls?.forEach(call => {
    console.log(`  ${call.retell_call_id} | ${call.call_status} | ${call.started_at}`);
  });
} else {
  console.log('\n❌ Sync failed:', data.error);
}
