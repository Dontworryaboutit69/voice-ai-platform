// Quick script to check if calls are in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCalls() {
  console.log('Checking for recent calls...\n');

  const { data: calls, error } = await supabase
    .from('calls')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching calls:', error);
    return;
  }

  if (!calls || calls.length === 0) {
    console.log('❌ No calls found in database');
    return;
  }

  console.log(`✅ Found ${calls.length} recent call(s):\n`);

  calls.forEach((call, index) => {
    console.log(`Call ${index + 1}:`);
    console.log(`  ID: ${call.id}`);
    console.log(`  Retell Call ID: ${call.retell_call_id}`);
    console.log(`  Agent ID: ${call.agent_id}`);
    console.log(`  Status: ${call.call_status}`);
    console.log(`  Started: ${call.started_at}`);
    console.log(`  Duration: ${call.duration_ms ? Math.ceil(call.duration_ms / 1000) + 's' : 'N/A'}`);
    console.log(`  From: ${call.from_number || 'N/A'}`);
    console.log(`  Transcript: ${call.transcript ? call.transcript.substring(0, 100) + '...' : 'N/A'}`);
    console.log('');
  });
}

checkCalls().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
