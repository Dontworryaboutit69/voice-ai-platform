import 'dotenv/config';
import { createServiceClient } from '../lib/supabase/client';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function debugCheckAvailability() {
  console.log('=== Debug Check Availability ===\n');

  const supabase = createServiceClient();

  // Step 1: Check if agent exists
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, business_name')
    .eq('id', AGENT_ID)
    .single();

  console.log('1. Agent lookup:');
  if (agentError) {
    console.error('   ERROR:', agentError);
  } else {
    console.log('   ✓ Found:', agent?.business_name, agent?.id);
  }

  // Step 2: Check for active integrations
  const { data: integrations, error: integrationError } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('is_active', true);

  console.log('\n2. Integration lookup (any active):');
  if (integrationError) {
    console.error('   ERROR:', integrationError);
  } else {
    console.log(`   Found ${integrations?.length || 0} active integrations`);
    integrations?.forEach(int => {
      console.log(`   - ${int.integration_type} (${int.id})`);
    });
  }

  // Step 3: Check for calendar integrations specifically
  const { data: calendarIntegrations, error: calendarError } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('is_active', true)
    .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar');

  console.log('\n3. Calendar integration lookup (GHL or Google):');
  if (calendarError) {
    console.error('   ERROR:', calendarError);
  } else {
    console.log(`   Found ${calendarIntegrations?.length || 0} calendar integrations`);
    calendarIntegrations?.forEach(int => {
      console.log(`   - ${int.integration_type}`);
      console.log(`     Config:`, JSON.stringify(int.config, null, 2));
    });
  }

  // Step 4: Try .single() query (as used in the endpoint)
  const { data: singleIntegration, error: singleError } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('is_active', true)
    .or('integration_type.eq.gohighlevel,integration_type.eq.google_calendar')
    .single();

  console.log('\n4. Single integration query (as in endpoint):');
  if (singleError) {
    console.error('   ERROR:', singleError);
  } else {
    console.log('   ✓ Found:', singleIntegration?.integration_type);
    console.log('   Config:', JSON.stringify(singleIntegration?.config, null, 2));
  }
}

debugCheckAvailability().catch(console.error);
