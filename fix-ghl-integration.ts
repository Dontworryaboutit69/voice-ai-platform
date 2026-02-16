/**
 * Comprehensive script to diagnose and fix GoHighLevel integration issues
 * Run with: npx tsx fix-ghl-integration.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test agent ID from Elite Dental
const TEST_AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

// GoHighLevel test credentials
const GHL_API_KEY = process.env.GHL_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'tSlwVUx54VrpROwxBAgm';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🔧 GoHighLevel Integration Fix Script\n');

  // Step 1: Check database schema
  console.log('📊 Step 1: Checking database schema...');
  await checkDatabaseSchema();

  // Step 2: Check if test agent exists
  console.log('\n👤 Step 2: Checking test agent...');
  await checkTestAgent();

  // Step 3: Test GoHighLevel API
  console.log('\n🌐 Step 3: Testing GoHighLevel API...');
  await testGoHighLevelAPI();

  console.log('\n✅ Diagnosis complete!');
  console.log('\n📋 Next steps:');
  console.log('1. If webhook_token column is missing, apply migration 012');
  console.log('2. If GHL API test failed, verify API credentials are correct');
  console.log('3. If all checks passed, test the integration in the UI');
}

async function checkDatabaseSchema() {
  try {
    // Check if webhook_token column exists
    const { data, error } = await supabase
      .from('agents')
      .select('id, webhook_token')
      .limit(1);

    if (error) {
      if (error.message.includes('webhook_token')) {
        console.log('❌ webhook_token column does NOT exist');
        console.log('   Need to apply migration 012_webhook_token.sql');
        console.log('   Run this SQL in Supabase Dashboard:');
        console.log('   ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;');
        return false;
      } else {
        console.log('❌ Database error:', error.message);
        return false;
      }
    }

    console.log('✅ webhook_token column exists');
    return true;
  } catch (error: any) {
    console.log('❌ Error checking schema:', error.message);
    return false;
  }
}

async function checkTestAgent() {
  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, name, retell_agent_id, webhook_token')
      .eq('id', TEST_AGENT_ID)
      .single();

    if (error || !agent) {
      console.log(`❌ Test agent ${TEST_AGENT_ID} not found`);
      return false;
    }

    console.log(`✅ Agent found: ${agent.name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Retell Agent ID: ${agent.retell_agent_id || 'Not set'}`);
    console.log(`   Webhook Token: ${agent.webhook_token ? '✓ Exists' : '✗ Not generated yet'}`);

    // If webhook token doesn't exist, generate one
    if (!agent.webhook_token) {
      console.log('   Generating webhook token...');
      const token = generateWebhookToken();
      await supabase
        .from('agents')
        .update({ webhook_token: token })
        .eq('id', TEST_AGENT_ID);
      console.log('   ✅ Webhook token generated');
    }

    return true;
  } catch (error: any) {
    console.log('❌ Error checking agent:', error.message);
    return false;
  }
}

async function testGoHighLevelAPI() {
  if (!GHL_API_KEY) {
    console.log('⚠️  GHL_API_KEY not set, skipping API tests');
    console.log('   To test: GHL_API_KEY=your_key npx tsx fix-ghl-integration.ts');
    return;
  }

  console.log(`Testing with Location ID: ${GHL_LOCATION_ID}`);

  const headers = {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  // Test 1: Verify authentication works
  console.log('\n🔑 Test 1: Verify authentication...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/locations/${GHL_LOCATION_ID}`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication successful');
      console.log(`   Location: ${data.location?.name || 'Unknown'}`);
    } else {
      console.log(`❌ Authentication failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return;
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
    return;
  }

  // Test 2: Try to fetch calendars (original endpoint)
  console.log('\n📅 Test 2: Fetch calendars (v1/calendars/)...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/calendars/?locationId=${GHL_LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Calendars endpoint works!');
      console.log(`   Found ${data.calendars?.length || 0} calendars`);

      if (data.calendars && data.calendars.length > 0) {
        console.log('   Calendars:');
        data.calendars.slice(0, 3).forEach((cal: any) => {
          console.log(`     - ${cal.name || cal.title} (${cal.id})`);
        });
      }
    } else {
      console.log('❌ Calendars endpoint failed');
      const errorText = await response.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 3: Try calendar services endpoint (alternative)
  console.log('\n📋 Test 3: Fetch calendar services (v1/calendars/services)...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/calendars/services?locationId=${GHL_LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Calendar services endpoint works!');
      console.log(`   Found ${data.services?.length || 0} services`);

      if (data.services && data.services.length > 0) {
        console.log('   Services:');
        data.services.slice(0, 3).forEach((svc: any) => {
          console.log(`     - ${svc.name} (${svc.id})`);
        });
      }
    } else {
      console.log('⚠️  Calendar services endpoint failed (this is normal if you don\'t have services configured)');
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }

  // Test 4: Try contacts endpoint (baseline test)
  console.log('\n👥 Test 4: Fetch contacts (baseline test)...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Contacts endpoint works!');
      console.log(`   Total contacts: ${data.total || 'Unknown'}`);
    } else {
      console.log('⚠️  Contacts endpoint failed');
    }
  } catch (error: any) {
    console.log('❌ Network error:', error.message);
  }
}

function generateWebhookToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

main().catch(console.error);
