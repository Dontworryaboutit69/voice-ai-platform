require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function traceWebCallFlow() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('=== CHECKING WEB CALL FLOW ===\n');

  // Check recent calls
  const { data: recentCalls } = await supabase
    .from('calls')
    .select('*')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('Recent calls in database:', recentCalls?.length || 0);
  if (recentCalls && recentCalls.length > 0) {
    recentCalls.forEach(call => {
      console.log(`  ${call.retell_call_id}:`);
      console.log(`    Status: ${call.call_status}, Duration: ${call.duration_ms}ms`);
      console.log(`    Transcript: ${call.transcript ? 'YES' : 'NO'}`);
    });
  }

  console.log('\n=== SYNC LOGS ===\n');

  const { data: syncLogs } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('Sync attempts:', syncLogs?.length || 0);
  if (syncLogs && syncLogs.length > 0) {
    syncLogs.forEach(log => {
      console.log(`  ${log.operation_type}: ${log.status}`);
      if (log.error_message) console.log(`    Error: ${log.error_message}`);
    });
  }
}

traceWebCallFlow();
