/**
 * Test GoHighLevel Integration
 * Usage: node scripts/test-ghl-integration.js
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InRTbHdWVXg1NFZycFJPd3hCQWdtIiwidmVyc2lvbiI6MSwiaWF0IjoxNzcwNzgwMjQzNzY4LCJzdWIiOiI1RnRWblZ0d25kcVRoMnZzZUNGVCJ9.OLd1vsFhmnCNfyOkm_7C_l_otruB7uNByASRy8rUrXY';
const GHL_LOCATION_ID = 'tSlwVUx54VrpROwxBAgm';

async function testGHLConnection() {
  console.log('🧪 Testing GoHighLevel API Connection...\n');

  // Test 1: Get location info
  console.log('📍 Test 1: Fetching location info...');
  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/locations/${GHL_LOCATION_ID}`, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Location found:', data.location?.name || 'Unknown');
      console.log('   Location ID:', GHL_LOCATION_ID);
    } else {
      const error = await response.json();
      console.log('❌ Failed to get location');
      console.log('   Status:', response.status);
      console.log('   Error:', error);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  console.log('');

  // Test 2: Search for contacts (to verify API access)
  console.log('👥 Test 2: Searching contacts...');
  try {
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Contact API accessible');
      console.log('   Total contacts:', data.meta?.total || 0);
    } else {
      const error = await response.json();
      console.log('❌ Failed to search contacts');
      console.log('   Status:', response.status);
      console.log('   Error:', error);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  console.log('');

  // Test 3: Create a test contact
  console.log('🆕 Test 3: Creating test contact...');
  try {
    const testContact = {
      locationId: GHL_LOCATION_ID,
      firstName: 'Test',
      lastName: 'Contact',
      phone: '+15555551234',
      email: 'test@example.com',
      tags: ['test-integration']
    };

    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContact)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test contact created successfully!');
      console.log('   Contact ID:', data.contact?.id);
      console.log('   Name:', data.contact?.firstName, data.contact?.lastName);
      return data.contact?.id;
    } else {
      const error = await response.json();
      console.log('❌ Failed to create contact');
      console.log('   Status:', response.status);
      console.log('   Error:', error);
      return null;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return null;
  }
}

async function testIntegrationClass() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing GoHighLevel Integration Class...\n');

  try {
    // Import the integration class
    const { GoHighLevelIntegration } = require('../lib/integrations/gohighlevel');

    const mockConnection = {
      id: 'test-123',
      agent_id: 'test-agent',
      organization_id: 'test-org',
      integration_type: 'gohighlevel',
      auth_type: 'api_key',
      api_key: GHL_API_KEY,
      config: {
        location_id: GHL_LOCATION_ID
      }
    };

    const ghl = new GoHighLevelIntegration(mockConnection);

    // Test 1: Validate connection
    console.log('🔗 Test 1: Validate connection...');
    const validation = await ghl.validateConnection();
    if (validation.success) {
      console.log('✅ Connection valid!');
    } else {
      console.log('❌ Connection invalid:', validation.error);
      return;
    }

    console.log('');

    // Test 2: Create contact
    console.log('👤 Test 2: Create contact via integration class...');
    const contactResult = await ghl.createContact({
      firstName: 'Integration',
      lastName: 'Test',
      phone: '+15555559999',
      email: 'integration-test@example.com'
    });

    if (contactResult.success) {
      console.log('✅ Contact created!');
      console.log('   Contact ID:', contactResult.data?.contactId);

      const contactId = contactResult.data?.contactId;

      // Test 3: Add note
      console.log('');
      console.log('📝 Test 3: Add note to contact...');
      const noteResult = await ghl.addNote({
        contactId,
        subject: 'Test Call',
        content: 'This is a test call note from the integration system.',
        timestamp: new Date()
      });

      if (noteResult.success) {
        console.log('✅ Note added successfully!');
      } else {
        console.log('❌ Failed to add note:', noteResult.error);
      }

    } else {
      console.log('❌ Failed to create contact:', contactResult.error);
    }

  } catch (err) {
    console.log('❌ Error testing integration class:', err.message);
    console.log(err.stack);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('GoHighLevel Integration Test Suite');
  console.log('='.repeat(60));
  console.log('');
  console.log('API Key (test key provided by user)');
  console.log('Location ID:', GHL_LOCATION_ID);
  console.log('');

  // Run direct API tests
  await testGHLConnection();

  // Run integration class tests
  await testIntegrationClass();

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Test suite complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
