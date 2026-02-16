import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function checkAgent() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, business_name, retell_phone_number, retell_agent_id, status')
    .eq('id', AGENT_ID)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📱 Agent Details:');
  console.log('   ID:', agent.id);
  console.log('   Business:', agent.business_name);
  console.log('   Phone:', agent.retell_phone_number || '❌ Not configured');
  console.log('   Retell Agent ID:', agent.retell_agent_id || '❌ Not configured');
  console.log('   Status:', agent.status);

  // Check for active HubSpot connection
  const { data: hubspot } = await supabase
    .from('integration_connections')
    .select('id, is_active, created_at')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .single();

  console.log('\n🎯 HubSpot Integration:');
  if (hubspot) {
    console.log('   Status: ✅ Connected');
    console.log('   Connection ID:', hubspot.id);
    console.log('   Connected:', new Date(hubspot.created_at).toLocaleString());
  } else {
    console.log('   Status: ❌ Not connected');
  }
}

checkAgent().catch(console.error);
