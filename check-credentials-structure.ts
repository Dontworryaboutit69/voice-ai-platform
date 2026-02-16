/**
 * Check the exact structure of credentials in database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkCredentials() {
  console.log('🔍 Checking credentials structure...\n');

  try {
    const { data: integrations, error } = await supabase
      .from('integration_connections')
      .select('id, credentials, api_key, api_secret, config')
      .eq('agent_id', AGENT_ID)
      .eq('integration_type', 'gohighlevel');

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log('ℹ️  No integration found');
      return;
    }

    const int = integrations[0];

    console.log('Integration record:');
    console.log(`  ID: ${int.id}`);
    console.log(`  credentials (jsonb): ${JSON.stringify(int.credentials, null, 2)}`);
    console.log(`  api_key (text): ${int.api_key ? int.api_key.substring(0, 15) + '...' : 'NULL'}`);
    console.log(`  api_secret (text): ${int.api_secret ? int.api_secret.substring(0, 15) + '...' : 'NULL'}`);
    console.log(`  config (jsonb): ${JSON.stringify(int.config, null, 2)}`);
    console.log('');

    // Check which field has the API key
    const apiKeyFromJsonb = (int.credentials as any)?.api_key;
    const apiKeyFromColumn = int.api_key;

    if (apiKeyFromColumn) {
      console.log('✅ API key found in api_key column!');
      console.log(`   Key preview: ${apiKeyFromColumn.substring(0, 15)}...${apiKeyFromColumn.slice(-4)}`);
      console.log('');
      console.log('Run test with:');
      console.log(`  GHL_API_KEY="${apiKeyFromColumn}" npx tsx test-with-real-credentials.ts\n`);
    } else if (apiKeyFromJsonb) {
      console.log('✅ API key found in credentials jsonb!');
      console.log(`   Key preview: ${apiKeyFromJsonb.substring(0, 15)}...${apiKeyFromJsonb.slice(-4)}`);
      console.log('');
      console.log('Run test with:');
      console.log(`  GHL_API_KEY="${apiKeyFromJsonb}" npx tsx test-with-real-credentials.ts\n`);
    } else {
      console.log('❌ No API key found in database');
      console.log('   Please add the integration through the UI with a valid API key\n');
    }

  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

checkCredentials().catch(console.error);
