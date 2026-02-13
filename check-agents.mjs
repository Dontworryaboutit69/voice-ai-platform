import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase.from('agents').select('id, business_name, business_type, created_at').order('created_at', { ascending: false });

if (error) {
  console.error('Error:', error);
} else {
  console.log('Found agents:', JSON.stringify(data, null, 2));
  if (data && data.length > 0) {
    console.log('\n✅ First agent:', data[0].business_name);
    console.log('Dashboard URL: http://localhost:3000/agents/' + data[0].id);
  } else {
    console.log('No agents found');
  }
}
