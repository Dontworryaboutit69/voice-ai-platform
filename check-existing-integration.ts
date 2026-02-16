/**
 * Check if there's an existing GoHighLevel integration with API key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkIntegration() {
  console.log('🔍 Checking for existing GoHighLevel integration...\n');

  try {
    const { data: integrations, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', AGENT_ID)
      .eq('integration_type', 'gohighlevel');

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log('ℹ️  No existing GoHighLevel integration found for this agent');
      console.log('   You need to add the integration through the UI first\n');
      return;
    }

    console.log(`Found ${integrations.length} integration(s):\n`);

    integrations.forEach((int, idx) => {
      console.log(`Integration ${idx + 1}:`);
      console.log(`  ID: ${int.id}`);
      console.log(`  Active: ${int.is_active}`);
      console.log(`  Status: ${int.connection_status}`);

      // Check if API key exists (don't print full key for security)
      const hasApiKey = !!(int.credentials as any)?.api_key;
      const apiKeyPreview = hasApiKey
        ? `${(int.credentials as any).api_key.substring(0, 10)}...`
        : 'Not set';

      console.log(`  API Key: ${apiKeyPreview}`);

      const locationId = (int.config as any)?.location_id;
      console.log(`  Location ID: ${locationId || 'Not set'}`);

      const calendarId = (int.config as any)?.calendar_id;
      console.log(`  Calendar ID: ${calendarId || 'Not set'}`);
      console.log('');

      if (hasApiKey && locationId) {
        console.log('✅ Integration has credentials! You can test it now.\n');
        console.log('Run:');
        console.log(`  GHL_API_KEY="${(int.credentials as any).api_key}" npx tsx test-with-real-credentials.ts\n`);
      }
    });

  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

checkIntegration().catch(console.error);
