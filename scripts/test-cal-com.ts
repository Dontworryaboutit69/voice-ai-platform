/**
 * Test Cal.com Integration
 * Usage: npx tsx scripts/test-cal-com.ts
 */

import 'dotenv/config';
import { CalComIntegration } from '@/lib/integrations/cal-com';

// NOTE: Set these in .env.local or pass as environment variables
const CAL_COM_API_KEY = process.env.CAL_COM_API_KEY || '';
const CAL_COM_EVENT_TYPE_ID = process.env.CAL_COM_EVENT_TYPE_ID || '';

async function testCalComIntegration() {
  console.log('='.repeat(60));
  console.log('Cal.com Integration Test Suite');
  console.log('='.repeat(60));
  console.log('');

  if (!CAL_COM_API_KEY) {
    console.error('❌ CAL_COM_API_KEY not set in environment');
    return;
  }

  const mockConnection = {
    id: 'test-123',
    agent_id: 'test-agent',
    organization_id: 'test-org',
    integration_type: 'cal_com' as const,
    is_active: true,
    connection_status: 'connected' as const,
    auth_type: 'api_key' as const,
    api_key: CAL_COM_API_KEY,
    config: {
      event_type_id: CAL_COM_EVENT_TYPE_ID
    },
    sync_enabled: true
  };

  const calcom = new CalComIntegration(mockConnection);

  // Test 1: Validate connection
  console.log('🔗 Test 1: Validate connection...');
  const validation = await calcom.validateConnection();
  if (validation.success) {
    console.log('✅ Connection valid!');
  } else {
    console.log('❌ Connection invalid:', validation.error);
    return;
  }

  console.log('');

  // Test 2: Get event types
  console.log('📅 Test 2: Fetch event types...');
  const eventTypesResult = await calcom.getEventTypes();
  if (eventTypesResult.success) {
    console.log('✅ Event types fetched!');
    console.log('   Found', eventTypesResult.data?.length || 0, 'event types');
    if (eventTypesResult.data && eventTypesResult.data.length > 0) {
      console.log('   First event:', eventTypesResult.data[0].title);
      console.log('   ID:', eventTypesResult.data[0].id);
      console.log('   Duration:', eventTypesResult.data[0].length, 'minutes');
    }
  } else {
    console.log('❌ Failed to fetch event types:', eventTypesResult.error);
  }

  console.log('');

  // Test 3: Check availability
  if (CAL_COM_EVENT_TYPE_ID) {
    console.log('🗓️  Test 3: Check availability...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availabilityResult = await calcom.checkAvailability(dateStr, 'America/New_York');
    if (availabilityResult.success) {
      console.log('✅ Availability checked!');
      console.log('   Available slots:', availabilityResult.data?.availableSlots.length || 0);
      if (availabilityResult.data?.availableSlots.length) {
        console.log('   First 5 slots:', availabilityResult.data.availableSlots.slice(0, 5).join(', '));
      }
    } else {
      console.log('❌ Failed to check availability:', availabilityResult.error);
    }
  } else {
    console.log('⏭️  Test 3: Skipped (no event type ID configured)');
  }

  console.log('');

  // Test 4: List webhooks
  console.log('🔔 Test 4: List webhooks...');
  const webhooksResult = await calcom.listWebhooks();
  if (webhooksResult.success) {
    console.log('✅ Webhooks fetched!');
    console.log('   Found', webhooksResult.data?.length || 0, 'webhooks');
  } else {
    console.log('❌ Failed to fetch webhooks:', webhooksResult.error);
  }

  console.log('');

  // Test 5: Create contact (synthetic for Cal.com)
  console.log('👤 Test 5: Create contact...');
  const contactResult = await calcom.createContact({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+15555551234'
  });

  if (contactResult.success) {
    console.log('✅ Contact created (synthetic)!');
    console.log('   Contact ID:', contactResult.data?.contactId);
  } else {
    console.log('❌ Failed to create contact:', contactResult.error);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Test suite complete!');
  console.log('='.repeat(60));
}

testCalComIntegration().catch(console.error);
