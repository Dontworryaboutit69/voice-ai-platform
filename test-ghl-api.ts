/**
 * Test script to verify GoHighLevel API endpoints
 * Run with: npx tsx test-ghl-api.ts
 */

// Test credentials from Elite Dental
const API_KEY = process.env.GHL_API_KEY || '';
const LOCATION_ID = process.env.GHL_LOCATION_ID || 'tSlwVUx54VrpROwxBAgm';

async function testEndpoints() {
  console.log('🔍 Testing GoHighLevel API Endpoints\n');
  console.log(`Location ID: ${LOCATION_ID}`);
  console.log(`API Key: ${API_KEY ? '✓ Set' : '✗ Missing'}\n`);

  if (!API_KEY) {
    console.error('❌ GHL_API_KEY environment variable not set');
    console.log('Usage: GHL_API_KEY=your_key npx tsx test-ghl-api.ts');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  // Test different API versions and endpoints
  const tests = [
    {
      name: 'V1 Calendars Endpoint',
      url: `https://rest.gohighlevel.com/v1/calendars/?locationId=${LOCATION_ID}`,
    },
    {
      name: 'V1 Calendars Services Endpoint',
      url: `https://rest.gohighlevel.com/v1/calendars/services?locationId=${LOCATION_ID}`,
    },
    {
      name: 'V1 Location Info',
      url: `https://rest.gohighlevel.com/v1/locations/${LOCATION_ID}`,
    },
    {
      name: 'V1 Contacts List (test auth)',
      url: `https://rest.gohighlevel.com/v1/contacts/?locationId=${LOCATION_ID}&limit=1`,
    },
  ];

  for (const test of tests) {
    console.log(`\n📍 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);

    try {
      const response = await fetch(test.url, { headers });
      const status = response.status;
      const statusText = response.statusText;

      console.log(`   Status: ${status} ${statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS`);
        console.log(`   Response keys:`, Object.keys(data));

        if (data.calendars) {
          console.log(`   📅 Found ${data.calendars.length} calendars`);
          if (data.calendars.length > 0) {
            console.log(`   First calendar:`, {
              id: data.calendars[0].id,
              name: data.calendars[0].name || data.calendars[0].title
            });
          }
        }

        if (data.services) {
          console.log(`   📋 Found ${data.services.length} calendar services`);
        }
      } else {
        console.log(`   ❌ FAILED`);
        try {
          const errorData = await response.text();
          console.log(`   Error:`, errorData.substring(0, 200));
        } catch (e) {
          console.log(`   Error: Could not read response body`);
        }
      }
    } catch (error: any) {
      console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    }
  }

  console.log('\n✨ Test complete!\n');
}

testEndpoints().catch(console.error);
