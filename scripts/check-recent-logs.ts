/**
 * Check Recent Integration Sync Logs
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function checkLogs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get HubSpot connection
  const { data: connection } = await supabase
    .from('integration_connections')
    .select('id')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .single();

  if (!connection) {
    console.log('No HubSpot connection found');
    return;
  }

  console.log('📊 Recent Integration Sync Logs:\n');

  const { data: logs, error } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('integration_connection_id', connection.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('❌ No sync logs found');
    console.log('   This means the integration sync might not have run');
    return;
  }

  logs.forEach((log, index) => {
    console.log(`${index + 1}. ${log.status.toUpperCase()} - ${log.operation_type}`);
    console.log(`   Time: ${new Date(log.created_at).toLocaleString()}`);
    console.log(`   Call ID: ${log.call_id || 'N/A'}`);
    if (log.error_message) {
      console.log(`   Error: ${log.error_message}`);
    }
    console.log('');
  });

  // Check recent calls
  console.log('\n📞 Recent Calls:\n');

  const { data: calls } = await supabase
    .from('calls')
    .select('id, retell_call_id, call_status, created_at, transcript')
    .eq('agent_id', AGENT_ID)
    .order('created_at', { ascending: false })
    .limit(5);

  if (calls && calls.length > 0) {
    calls.forEach((call, index) => {
      console.log(`${index + 1}. Call ID: ${call.retell_call_id}`);
      console.log(`   Status: ${call.call_status}`);
      console.log(`   Created: ${new Date(call.created_at).toLocaleString()}`);
      console.log(`   Has Transcript: ${call.transcript ? 'Yes' : 'No'}`);
      console.log('');
    });
  } else {
    console.log('No calls found');
  }
}

checkLogs().catch(console.error);
