/**
 * Test Calendly Integration
 * Usage: npx tsx scripts/test-calendly.ts
 */

import 'dotenv/config';
import { CalendlyIntegration } from '@/lib/integrations/calendly';

// NOTE: Set these in .env.local or pass as environment variables
const CALENDLY_ACCESS_TOKEN = process.env.CALENDLY_ACCESS_TOKEN || '';
const CALENDLY_EVENT_TYPE_URI = process.env.CALENDLY_EVENT_TYPE_URI || '';

async function testCalendlyIntegration() {
  console.log('='.repeat(60));
  console.log('Calendly Integration Test Suite');
  console.log('='.repeat(60));
  console.log('');

  if (!CALENDLY_ACCESS_TOKEN) {
    console.error('❌ CALENDLY_ACCESS_TOKEN not set in environment');
    return;
  }

  const mockConnection = {
    id: 'test-123',
    agent_id: 'test-agent',
    organization_id: 'test-org',
    integration_type: 'calendly' as const,
    is_active: true,
    connection_status: 'connected' as const,
    auth_type: 'oauth' as const,
    access_token: CALENDLY_ACCESS_TOKEN,
    config: {
      event_type_uri: CALENDLY_EVENT_TYPE_URI
    },
    sync_enabled: true
  };

  const calendly = new CalendlyIntegration(mockConnection);

  // Test 1: Validate connection
  console.log('🔗 Test 1: Validate connection...');
  const validation = await calendly.validateConnection();
  if (validation.success) {
    console.log('✅ Connection valid!');
  } else {
    console.log('❌ Connection invalid:', validation.error);
    return;
  }

  console.log('');

  // Test 2: Get event types
  console.log('📅 Test 2: Fetch event types...');
  const eventTypesResult = await calendly.getEventTypes();
  if (eventTypesResult.success) {
    console.log('✅ Event types fetched!');
    console.log('   Found', eventTypesResult.data?.length || 0, 'event types');
    if (eventTypesResult.data && eventTypesResult.data.length > 0) {
      console.log('   First event:', eventTypesResult.data[0].name);
      console.log('   URI:', eventTypesResult.data[0].uri);
    }
  } else {
    console.log('❌ Failed to fetch event types:', eventTypesResult.error);
  }

  console.log('');

  // Test 3: Check availability
  if (CALENDLY_EVENT_TYPE_URI) {
    console.log('🗓️  Test 3: Check availability...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availabilityResult = await calendly.checkAvailability(dateStr, 'America/New_York');
    if (availabilityResult.success) {
      console.log('✅ Availability checked!');
      console.log('   Available slots:', availabilityResult.data?.availableSlots.length || 0);
      if (availabilityResult.data?.availableSlots.length) {
        console.log('   First slot:', availabilityResult.data.availableSlots[0]);
      }
    } else {
      console.log('❌ Failed to check availability:', availabilityResult.error);
    }
  } else {
    console.log('⏭️  Test 3: Skipped (no event type URI configured)');
  }

  console.log('');

  // Test 4: Create contact (synthetic for Calendly)
  console.log('👤 Test 4: Create contact...');
  const contactResult = await calendly.createContact({
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

testCalendlyIntegration().catch(console.error);
