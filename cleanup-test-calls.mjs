import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
);

console.log('🧹 Cleaning up test calls...');

// Delete test calls
const { data, error } = await supabase
  .from('calls')
  .delete()
  .or('retell_call_id.like.%test%,retell_call_id.like.%comprehensive%,retell_call_id.like.%direct_insert%')
  .select();

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log(`✅ Deleted ${data.length} test calls`);
  data.forEach(call => {
    console.log(`  - ${call.retell_call_id}`);
  });
}

// Show remaining calls
const { data: remaining } = await supabase
  .from('calls')
  .select('retell_call_id, call_status, started_at')
  .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
  .order('created_at', { ascending: false })
  .limit(10);

console.log('\n📋 Remaining calls:');
remaining?.forEach(call => {
  console.log(`  - ${call.retell_call_id} (${call.call_status}) - ${new Date(call.started_at).toLocaleString()}`);
});
