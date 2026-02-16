/**
 * Test HubSpot Integration
 * Simulates a call end and syncs data to HubSpot
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { HubSpotIntegration } from '../lib/integrations/hubspot';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7'; // Your agent ID

async function testHubSpotSync() {
  console.log('🧪 Testing HubSpot Integration...\n');

  // Create Supabase client for direct access (not server-client)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Simulate call data (matching CallData interface from base-integration.ts)
  const now = new Date();
  const callData = {
    callId: 'test-call-' + Date.now(),
    agentId: AGENT_ID,
    customerName: 'Test User',
    customerPhone: '+15555551234',
    customerEmail: 'test@example.com',
    callOutcome: 'interested',
    callSummary: 'Customer called to inquire about services. Interested in premium package.',
    callSentiment: 'positive',
    transcript: 'Agent: Hello! How can I help you today?\nCaller: Hi, I\'m interested in learning more about your services.',
    recordingUrl: undefined,
    startedAt: new Date(now.getTime() - 180000), // 3 minutes ago
    endedAt: now,
    durationSeconds: 180
  };

  try {
    console.log('📞 Simulating call end for agent:', AGENT_ID);
    console.log('📋 Call data:', JSON.stringify(callData, null, 2), '\n');

    // Get HubSpot connection directly
    const { data: connection, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', AGENT_ID)
      .eq('integration_type', 'hubspot')
      .eq('is_active', true)
      .single();

    if (error || !connection) {
      console.error('❌ No active HubSpot connection found for agent:', AGENT_ID);
      console.error('Error:', error);
      return;
    }

    console.log('✅ Found HubSpot connection:', connection.id);
    console.log('🔑 Access token:', connection.access_token?.substring(0, 20) + '...\n');

    // Create HubSpot integration instance with supabase client
    const hubspot = new HubSpotIntegration(connection, supabase);

    // Process call data
    const result = await hubspot.processCallData(callData);

    if (result.success) {
      console.log('\n✅ Integration sync completed!');
      console.log('📊 Check your HubSpot account for:');
      console.log('   - New contact: Test User (test@example.com)');
      console.log('   - Phone: +15555551234');
      console.log('   - Note with call summary and transcript\n');
    } else {
      console.error('\n❌ Integration sync failed:', result.error);
    }

  } catch (error: any) {
    console.error('\n❌ Integration sync failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testHubSpotSync();
