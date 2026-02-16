/**
 * Check actual database schema for integration_connections
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Get all columns from the integration
    const { data: integrations, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', AGENT_ID)
      .eq('integration_type', 'gohighlevel')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (!integrations || integrations.length === 0) {
      console.log('ℹ️  No integration found');
      return;
    }

    const int = integrations[0];

    console.log('Integration record columns and values:\n');
    Object.keys(int).forEach(key => {
      const value = (int as any)[key];

      if (key === 'api_key' || key === 'api_secret') {
        if (value) {
          console.log(`  ${key}: ${value.substring(0, 15)}...${value.slice(-4)}`);
        } else {
          console.log(`  ${key}: NULL`);
        }
      } else if (typeof value === 'object') {
        console.log(`  ${key}: ${JSON.stringify(value, null, 2)}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    console.log('\n');

    // Extract API key from wherever it is
    const apiKey = (int as any).api_key;

    if (apiKey) {
      console.log('✅ Found API key!');
      console.log(`   Preview: ${apiKey.substring(0, 15)}...${apiKey.slice(-4)}`);
      console.log('');
      console.log('🧪 Running test now with this API key...\n');

      // Run test automatically
      await runTest(apiKey);
    } else {
      console.log('❌ No API key found in database');
      console.log('   The integration exists but API key was not saved');
      console.log('');
      console.log('📋 Please provide your GoHighLevel API key to test\n');
    }

  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

async function runTest(apiKey: string) {
  const LOCATION_ID = 'tSlwVUx54VrpROwxBAgm';

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  // Test 1: Auth
  console.log('1. Testing GoHighLevel API authentication...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/locations/${LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Auth successful! Location: ${data.location?.name || 'Unknown'}\n`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Auth failed: ${error.substring(0, 150)}\n`);
      return;
    }
  } catch (error: any) {
    console.log(`   ❌ Network error: ${error.message}\n`);
    return;
  }

  // Test 2: Calendars
  console.log('2. Testing calendars endpoint...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/calendars/?locationId=${LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      const calendars = data.calendars || [];
      console.log(`   ✅ Found ${calendars.length} calendars!`);

      if (calendars.length > 0) {
        console.log('   Calendars:');
        calendars.slice(0, 5).forEach((cal: any) => {
          console.log(`     - ${cal.name || cal.title} (${cal.id})`);
        });
      }
      console.log('');
    } else {
      const error = await response.text();
      console.log(`   ⚠️  Calendars endpoint: ${error.substring(0, 150)}\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }

  // Test 3: Our API
  console.log('3. Testing our API endpoint...');
  try {
    const response = await fetch(
      `http://localhost:3000/api/agents/${AGENT_ID}/integrations/gohighlevel/calendars`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          location_id: LOCATION_ID
        })
      }
    );

    const data = await response.json();

    console.log(`   Status: ${response.status}`);

    if (data.success) {
      console.log(`   ✅ Our API works! Found ${data.calendars?.length || 0} calendars\n`);
    } else {
      console.log(`   ❌ Our API failed: ${data.error}\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('✅ Testing complete!\n');
}

checkSchema().catch(console.error);
