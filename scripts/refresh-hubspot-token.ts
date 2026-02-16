/**
 * Refresh HubSpot OAuth Token
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function refreshToken() {
  console.log('🔄 Refreshing HubSpot OAuth token...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get HubSpot connection
  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    console.error('❌ No HubSpot connection found:', error);
    return;
  }

  console.log('✅ Found HubSpot connection:', connection.id);
  console.log('🔑 Current token expires:', connection.token_expires_at);
  console.log('   Expired:', new Date(connection.token_expires_at) < new Date() ? 'Yes' : 'No');

  if (!connection.refresh_token) {
    console.error('❌ No refresh token available');
    return;
  }

  console.log('\n🔄 Requesting new access token from HubSpot...');

  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      refresh_token: connection.refresh_token,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Token refresh failed:', error);
    return;
  }

  const tokens = await response.json();
  console.log('✅ New tokens received');
  console.log('   Access token:', tokens.access_token.substring(0, 20) + '...');
  console.log('   Expires in:', tokens.expires_in, 'seconds');

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  // Update in database
  const { error: updateError } = await supabase
    .from('integration_connections')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', connection.id);

  if (updateError) {
    console.error('❌ Failed to update database:', updateError);
    return;
  }

  console.log('✅ Database updated');
  console.log('   New expiration:', expiresAt.toLocaleString());
  console.log('\n🎉 Token refresh successful!');
}

refreshToken().catch(console.error);
