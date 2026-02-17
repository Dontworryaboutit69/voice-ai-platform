import 'dotenv/config';
import { createServiceClient } from '../lib/supabase/client';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function checkIntegrationStatus() {
  const supabase = createServiceClient();

  // Check integration status
  const { data: integration, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'gohighlevel')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (!integration) {
    console.log('❌ No GoHighLevel integration found for this agent');
    return;
  }

  console.log('✅ Integration found:');
  console.log('   ID:', integration.id);
  console.log('   Active:', integration.is_active);
  console.log('   Location ID:', integration.config?.location_id);
  console.log('   Create Contacts:', integration.config?.createContacts);
  console.log('   Log Calls:', integration.config?.logCalls);
  console.log('\nFull config:', JSON.stringify(integration.config, null, 2));

  // Check recent calls
  const { data: calls } = await supabase
    .from('calls')
    .select('id, retell_call_id, started_at, ended_at, duration_ms')
    .eq('agent_id', AGENT_ID)
    .order('started_at', { ascending: false })
    .limit(5);

  console.log('\n📞 Recent calls:');
  if (!calls || calls.length === 0) {
    console.log('   No calls found');
  } else {
    calls.forEach((call, i) => {
      console.log(`   ${i + 1}. ${call.retell_call_id} - ${call.started_at}`);
    });
  }

  // Check integration sync logs
  const { data: logs } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('\n📋 Recent integration sync logs:');
  if (!logs || logs.length === 0) {
    console.log('   ❌ No sync logs found - integrations may not be running!');
  } else {
    logs.forEach((log, i) => {
      console.log(`   ${i + 1}. ${log.operation_type} - ${log.status} - ${log.created_at}`);
      if (log.error_message) {
        console.log(`      Error: ${log.error_message}`);
      }
    });
  }
}

checkIntegrationStatus().catch(console.error);
