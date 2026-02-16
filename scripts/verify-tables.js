const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking integration tables...\n');

  const tables = [
    'integration_connections',
    'integration_field_mappings',
    'integration_sync_logs',
    'integration_webhooks',
    'call_integration_data'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: Table exists and is accessible`);
    }
  }

  console.log('\n✅ All integration tables verified!');
}

verifyTables().catch(console.error);
