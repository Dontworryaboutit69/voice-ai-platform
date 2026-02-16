/**
 * Test GoHighLevel integration with real credentials
 * Run with: GHL_API_KEY=your_key npx tsx test-with-real-credentials.ts
 */

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const LOCATION_ID = 'tSlwVUx54VrpROwxBAgm';
const API_KEY = process.env.GHL_API_KEY || '';

if (!API_KEY) {
  console.log('❌ Please provide GHL_API_KEY environment variable');
  console.log('Usage: GHL_API_KEY=your_key npx tsx test-with-real-credentials.ts');
  process.exit(1);
}

console.log('🧪 Testing GoHighLevel Integration with Real Credentials\n');
console.log(`Agent ID: ${AGENT_ID}`);
console.log(`Location ID: ${LOCATION_ID}`);
console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.slice(-4)}\n`);

async function testDirectGHLAPI() {
  console.log('📡 Step 1: Testing GoHighLevel API directly...\n');

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  // Test 1: Verify auth with location endpoint
  console.log('1. Testing authentication (GET /locations/{locationId})...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/locations/${LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Auth successful! Location: ${data.location?.name || 'Unknown'}\n`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Auth failed: ${error.substring(0, 200)}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Network error: ${error.message}\n`);
    return false;
  }

  // Test 2: Try calendar services endpoint
  console.log('2. Testing calendar services endpoint...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/calendars/services?locationId=${LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      const services = data.services || [];
      console.log(`   ✅ Found ${services.length} calendar services`);
      if (services.length > 0) {
        services.slice(0, 3).forEach((svc: any) => {
          console.log(`      - ${svc.name} (${svc.id})`);
        });
      }
      console.log('');
      return true;
    } else {
      console.log(`   ⚠️  Services endpoint not available (this is OK)\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Services endpoint failed (this is OK)\n`);
  }

  // Test 3: Try regular calendars endpoint
  console.log('3. Testing calendars endpoint...');
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/calendars/?locationId=${LOCATION_ID}`,
      { headers }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      const calendars = data.calendars || [];
      console.log(`   ✅ Found ${calendars.length} calendars`);
      if (calendars.length > 0) {
        calendars.slice(0, 3).forEach((cal: any) => {
          console.log(`      - ${cal.name || cal.title} (${cal.id})`);
        });
      }
      console.log('');
      return true;
    } else {
      const error = await response.text();
      console.log(`   ❌ Calendars endpoint failed: ${error.substring(0, 200)}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Network error: ${error.message}\n`);
    return false;
  }
}

async function testOurAPI() {
  console.log('🔧 Step 2: Testing our API endpoint...\n');

  const url = `http://localhost:3000/api/agents/${AGENT_ID}/integrations/gohighlevel/calendars`;

  console.log(`Calling: POST ${url}\n`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: API_KEY,
        location_id: LOCATION_ID
      })
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\n✅ SUCCESS! Our API works!`);
      console.log(`Found ${data.calendars?.length || 0} calendars\n`);
      return true;
    } else {
      console.log(`\n❌ Our API failed: ${data.error}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Network error: ${error.message}\n`);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('🔧 Step 3: Testing webhook endpoint...\n');

  const url = `http://localhost:3000/api/agents/${AGENT_ID}/trigger-call`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(`Status: ${response.status}`);

    if (data.success) {
      console.log(`✅ Webhook endpoint works!`);
      console.log(`URL: ${data.webhook_url}`);
      console.log(`Token: ${data.webhook_token?.substring(0, 10)}...\n`);
      return true;
    } else {
      console.log(`❌ Webhook failed: ${data.error}\n`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Network error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  // Test GHL API directly
  const ghlWorks = await testDirectGHLAPI();

  if (!ghlWorks) {
    console.log('❌ GoHighLevel API test failed. Check your API key and location ID.\n');
    return;
  }

  // Wait a moment for server to be ready
  console.log('Waiting for dev server...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test our API
  const apiWorks = await testOurAPI();

  // Test webhook endpoint
  const webhookWorks = await testWebhookEndpoint();

  console.log('📋 Summary:\n');
  console.log(`  GoHighLevel API: ${ghlWorks ? '✅' : '❌'}`);
  console.log(`  Our Calendar API: ${apiWorks ? '✅' : '❌'}`);
  console.log(`  Webhook Endpoint: ${webhookWorks ? '✅' : '❌'}`);
  console.log('');

  if (ghlWorks && apiWorks && webhookWorks) {
    console.log('🎉 All tests passed! Integration is ready to use.\n');
    console.log('Next steps:');
    console.log('  1. Go to http://localhost:3000/agents/f02fd2dc-32d7-42b8-8378-126d354798f7');
    console.log('  2. Click "+ Add Integration" → "GoHighLevel"');
    console.log('  3. Enter your API key and Location ID');
    console.log('  4. Click "Load My Calendars"');
    console.log('  5. Select a calendar and save\n');
  }
}

main().catch(console.error);
