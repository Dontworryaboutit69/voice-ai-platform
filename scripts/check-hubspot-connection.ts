/**
 * Check HubSpot OAuth Connection
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function checkConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ HubSpot connection found!');
    console.log('Connection ID:', data[0].id);
    console.log('Created at:', data[0].created_at);
    console.log('Access token (first 20 chars):', data[0].access_token?.substring(0, 20) + '...');
    console.log('Refresh token exists:', !!data[0].refresh_token);
    console.log('Token expires at:', data[0].token_expires_at);
  } else {
    console.log('❌ No HubSpot connection found');
  }
}

checkConnection();
