const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getRecentCall() {
  // Get Elite Dental agent
  const { data: agent } = await supabase
    .from('agents')
    .select('id, business_name')
    .ilike('business_name', '%Elite%')
    .single();

  if (!agent) {
    console.log('Agent not found');
    return;
  }

  console.log('Agent:', agent.business_name, agent.id);

  // Get most recent call
  const { data: calls, error } = await supabase
    .from('calls')
    .select('id, retell_call_id, started_at, call_status, transcript')
    .eq('agent_id', agent.id)
    .order('started_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nRecent calls:');
  calls.forEach((call, i) => {
    console.log(`\n${i + 1}. Call ID: ${call.id}`);
    console.log(`   Retell ID: ${call.retell_call_id}`);
    console.log(`   Started: ${call.started_at}`);
    console.log(`   Status: ${call.call_status}`);
    console.log(`   Transcript length: ${call.transcript?.length || 0}`);

    if (call.transcript && call.transcript.includes('Kyle')) {
      console.log('   ✅ Contains "Kyle" - this is likely your test call!');
    }
  });

  // Return the most recent call ID for use with debug endpoint
  if (calls && calls.length > 0) {
    console.log(`\n\nTo manually sync the most recent call, run:`);
    console.log(`curl -X POST https://voice-ai-platform-orcin.vercel.app/api/debug/sync-call -H "Content-Type: application/json" -d '{"callId":"${calls[0].id}"}'`);
  }
}

getRecentCall();
