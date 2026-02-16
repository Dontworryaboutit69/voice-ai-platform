/**
 * Test the calendar endpoint directly to see what error we get
 */

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7'; // Elite Dental Care
const API_KEY = process.env.GHL_API_KEY || 'test_key';
const LOCATION_ID = process.env.GHL_LOCATION_ID || 'tSlwVUx54VrpROwxBAgm';

async function testCalendarEndpoint() {
  console.log('🧪 Testing Calendar Endpoint\n');
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`Location ID: ${LOCATION_ID}`);
  console.log(`API Key: ${API_KEY ? '***' + API_KEY.slice(-4) : 'Not set'}\n`);

  const url = `http://localhost:3000/api/agents/${AGENT_ID}/integrations/gohighlevel/calendars`;

  console.log(`Calling: POST ${url}\n`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: API_KEY,
        location_id: LOCATION_ID
      })
    });

    const status = response.status;
    const data = await response.json();

    console.log(`Status: ${status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log('');

    if (data.success) {
      console.log(`✅ SUCCESS! Found ${data.calendars?.length || 0} calendars`);
      if (data.calendars && data.calendars.length > 0) {
        console.log('\nCalendars:');
        data.calendars.forEach((cal: any) => {
          console.log(`  - ${cal.name || cal.title} (${cal.id})`);
        });
      }
    } else {
      console.log(`❌ FAILED: ${data.error}`);
    }

  } catch (error: any) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing Webhook Endpoint\n');

  const url = `http://localhost:3000/api/agents/${AGENT_ID}/trigger-call`;

  console.log(`Calling: GET ${url}\n`);

  try {
    const response = await fetch(url);
    const status = response.status;
    const data = await response.json();

    console.log(`Status: ${status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\n✅ SUCCESS!`);
      console.log(`Webhook URL: ${data.webhook_url}`);
      console.log(`Token: ${data.webhook_token?.substring(0, 10)}...`);
    } else {
      console.log(`\n❌ FAILED: ${data.error}`);
    }

  } catch (error: any) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function main() {
  await testCalendarEndpoint();
  await testWebhookEndpoint();
}

// Wait for server to start
setTimeout(main, 2000);
