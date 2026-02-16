import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRecentCalls() {
  console.log('Checking recent calls...\n');

  const { data: calls, error } = await supabase
    .from('calls')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!calls || calls.length === 0) {
    console.log('No calls found');
    return;
  }

  const call = calls[0];
  console.log('Most Recent Call:');
  console.log('==================');
  console.log('Call ID:', call.id);
  console.log('Retell Call ID:', call.retell_call_id);
  console.log('From:', call.from_number);
  console.log('Started:', call.started_at);
  console.log('Duration:', call.duration_ms, 'ms');
  console.log('\nTranscript Object:');
  console.log(JSON.stringify(call.transcript_object, null, 2));
  console.log('\n\nChecking integration sync logs...\n');

  const { data: syncLogs } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('call_id', call.id)
    .order('created_at', { ascending: false });

  if (syncLogs && syncLogs.length > 0) {
    console.log('Integration Sync Logs:');
    syncLogs.forEach(log => {
      console.log('---');
      console.log('Integration:', log.integration_type);
      console.log('Status:', log.status);
      console.log('Operation:', log.operation);
      console.log('Response:', log.response_data);
      if (log.error_message) {
        console.log('Error:', log.error_message);
      }
    });
  } else {
    console.log('❌ NO INTEGRATION SYNC LOGS FOUND!');
    console.log('This means the webhook is not triggering integration sync.');
  }
}

checkRecentCalls();
