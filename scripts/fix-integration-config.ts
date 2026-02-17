import 'dotenv/config';
import { createServiceClient } from '../lib/supabase/client';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function fixIntegrationConfig() {
  const supabase = createServiceClient();

  // Get current integration
  const { data: integration } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'gohighlevel')
    .single();

  if (!integration) {
    console.log('❌ Integration not found');
    return;
  }

  console.log('Current config:', integration.config);

  // Update config with missing settings
  const updatedConfig = {
    ...integration.config,
    createContacts: true,
    logCalls: true,
    addToPipeline: false,
    triggerWorkflows: false
  };

  const { error } = await supabase
    .from('integration_connections')
    .update({ config: updatedConfig })
    .eq('id', integration.id);

  if (error) {
    console.error('❌ Error updating config:', error);
  } else {
    console.log('✅ Integration config updated:');
    console.log(JSON.stringify(updatedConfig, null, 2));
  }
}

fixIntegrationConfig().catch(console.error);
