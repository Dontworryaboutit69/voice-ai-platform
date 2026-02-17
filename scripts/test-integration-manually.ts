import 'dotenv/config';
import { createServiceClient } from '../lib/supabase/client';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const TEST_CALL_ID = 'call_bde2e1fc0b737a854cf0fac0ec9'; // Most recent call

async function testIntegrationManually() {
  console.log('=== Testing Integration Manually ===\n');

  const supabase = createServiceClient();

  // Get the call
  const { data: callData } = await supabase
    .from('calls')
    .select('*')
    .eq('retell_call_id', TEST_CALL_ID)
    .single();

  if (!callData) {
    console.log('❌ Call not found');
    return;
  }

  console.log('📞 Call found:');
  console.log('   ID:', callData.id);
  console.log('   Duration:', callData.duration_ms, 'ms');
  console.log('   Transcript length:', callData.transcript?.length || 0);

  // Import the integration processing
  const { processCallThroughIntegrations } = await import('../lib/integrations/integration-factory');

  // Prepare integration call data
  const integrationCallData = {
    callId: callData.id,
    customerName: 'Test Customer',
    customerPhone: callData.from_number || '+1234567890',
    customerEmail: 'test@example.com',
    callDuration: callData.duration_ms || 60000,
    callTranscript: callData.transcript || 'Test transcript',
    callRecording: callData.recording_url,
    callSummary: 'Test call summary',
    callSentiment: 'positive' as const,
    callOutcome: 'qualified_lead',
    collectedData: {
      name: 'Test Customer',
      phone: callData.from_number || '+1234567890'
    }
  };

  console.log('\n🔄 Processing through integrations...\n');

  try {
    await processCallThroughIntegrations(AGENT_ID, integrationCallData);
    console.log('\n✅ Integration processing complete!');

    // Check sync logs
    const { data: logs } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('call_id', callData.id)
      .order('created_at', { ascending: false });

    console.log('\n📋 Sync logs created:');
    if (!logs || logs.length === 0) {
      console.log('   ❌ No logs found!');
    } else {
      logs.forEach(log => {
        console.log(`   - ${log.operation_type}: ${log.status}`);
        if (log.error_message) {
          console.log(`     Error: ${log.error_message}`);
        }
      });
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

testIntegrationManually().catch(console.error);
