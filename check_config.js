require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: integration } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .eq('integration_type', 'gohighlevel')
    .eq('is_active', true)
    .single();

  console.log('GHL Integration:');
  console.log('  Found:', !!integration);
  if (integration) {
    console.log('  calendar_id:', integration.config?.calendar_id);
    console.log('  location_id:', integration.config?.location_id);
  }
}

check();
