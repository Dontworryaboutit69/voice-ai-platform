// Test if we can insert directly with the service role key
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Testing direct insert with service role key...');

const testData = {
  retell_call_id: `direct_insert_test_${Date.now()}`,
  agent_id: 'f02fd2dc-32d7-42b8-8378-126d354798f7',
  from_number: '+15555551234',
  to_number: '+15555555678',
  started_at: new Date().toISOString(),
  call_status: 'in_progress'
};

console.log('Data to insert:', testData);

const { data, error } = await supabase
  .from('calls')
  .insert(testData);

if (error) {
  console.log('\n❌ INSERT FAILED');
  console.log('Error:', error);
} else {
  console.log('\n✅ INSERT SUCCEEDED');
  console.log('Data:', data);
}
