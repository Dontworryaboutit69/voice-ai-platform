require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, business_name')
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Agents found:');
    data.forEach(agent => {
      console.log(`  - ${agent.id}: ${agent.name} (${agent.business_name})`);
    });
  }
}

checkAgents();
