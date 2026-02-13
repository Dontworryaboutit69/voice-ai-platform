import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, business_name, status')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No agents found in database.');
    console.log('\nYou need to create an agent first by going to:');
    console.log('http://localhost:3000/onboarding');
    return;
  }

  console.log('\nFound agents:');
  console.log('='.repeat(80));
  data.forEach((agent, idx) => {
    console.log(`\n${idx + 1}. ${agent.business_name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Status: ${agent.status}`);
    console.log(`   Dashboard: http://localhost:3000/agents/${agent.id}`);
  });
  console.log('\n' + '='.repeat(80));
}

getAgents();
