import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
const GHL_CLIENT_SECRET = process.env.GHL_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://voice-ai-platform-phi.vercel.app';
const REDIRECT_URI = `${APP_URL}/api/integrations/oauth/crm/callback`;

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors from GHL
    if (error) {
      console.error('[GHL OAuth] Authorization error:', error);
      return renderResult(false, `GHL auth error: ${error}`);
    }

    if (!code || !state) {
      console.error('[GHL OAuth] Missing code or state. code:', !!code, 'state:', !!state);
      return renderResult(false, `Missing params - code: ${!!code}, state: ${!!state}`);
    }

    // Validate CSRF state token
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('integration_type', 'gohighlevel')
      .single();

    if (stateError || !stateRecord) {
      console.error('[GHL OAuth] Invalid state token:', stateError);
      return renderResult(false, `State validation failed: ${stateError?.message || 'no record found'} (state=${state.substring(0, 8)}...)`);
    }

    // Check if state is expired
    if (new Date(stateRecord.expires_at) < new Date()) {
      console.error('[GHL OAuth] State token expired');
      await supabase.from('oauth_states').delete().eq('id', stateRecord.id);
      return renderResult(false, `Session expired. Created: ${stateRecord.expires_at}`);
    }

    const agentId = stateRecord.agent_id;
    const organizationId = stateRecord.organization_id;

    // Clean up the state token (single-use)
    await supabase.from('oauth_states').delete().eq('id', stateRecord.id);

    // Exchange authorization code for tokens
    console.log('[GHL OAuth] Exchanging code for tokens...');
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: GHL_CLIENT_ID || '',
        client_secret: GHL_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        user_type: 'Location',
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('[GHL OAuth] Token exchange failed:', tokenResponse.status, errorBody);
      return renderResult(false, `Token exchange failed (${tokenResponse.status}): ${errorBody.substring(0, 200)}`);
    }

    const tokens = await tokenResponse.json();
    console.log('[GHL OAuth] Token exchange successful. Location:', tokens.locationId);

    // Extract location info from the token response
    const locationId = tokens.locationId;
    const companyId = tokens.companyId;

    // Fetch location details to get the business name
    let locationName = 'Connected Location';
    try {
      const locationResponse = await fetch(
        `https://services.leadconnectorhq.com/locations/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Version': '2021-07-28',
            'Accept': 'application/json',
          },
        }
      );
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        locationName = locationData.location?.name || locationData.name || locationName;
        console.log('[GHL OAuth] Location name:', locationName);
      }
    } catch (e) {
      console.warn('[GHL OAuth] Could not fetch location details:', e);
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 86399) * 1000).toISOString();

    // Upsert integration_connections record
    // Check if there's an existing GHL connection for this agent
    const { data: existing } = await supabase
      .from('integration_connections')
      .select('id')
      .eq('agent_id', agentId)
      .eq('integration_type', 'gohighlevel')
      .single();

    const connectionData = {
      agent_id: agentId,
      organization_id: organizationId,
      integration_type: 'gohighlevel',
      is_active: true,
      connection_status: 'connected',
      auth_type: 'oauth',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      api_key: null, // Clear any old API key
      config: {
        location_id: locationId,
        company_id: companyId,
        location_name: locationName,
        scopes: tokens.scope,
        user_type: tokens.userType || 'Location',
        connected_at: new Date().toISOString(),
      },
      last_error: null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('integration_connections')
        .update(connectionData)
        .eq('id', existing.id);

      if (updateError) {
        console.error('[GHL OAuth] Failed to update connection:', updateError);
        return renderResult(false, `DB update failed: ${updateError.message}`);
      }
      console.log('[GHL OAuth] Updated existing connection:', existing.id);
    } else {
      // Create new connection
      const { error: insertError } = await supabase
        .from('integration_connections')
        .insert(connectionData);

      if (insertError) {
        console.error('[GHL OAuth] Failed to create connection:', insertError);
        return renderResult(false, `DB insert failed: ${insertError.message}`);
      }
      console.log('[GHL OAuth] Created new connection for agent:', agentId);
    }

    // Success! Send message to opener window and redirect
    return renderResult(true, `Connected to ${locationName}!`, agentId, locationId);
  } catch (error: any) {
    console.error('[GHL OAuth] Unexpected error in callback:', error);
    return renderResult(false, `Unexpected error: ${error.message || error}`);
  }
}

function renderResult(
  success: boolean,
  message: string,
  agentId?: string,
  locationId?: string
): NextResponse {
  const statusColor = success ? '#22c55e' : '#ef4444';
  const statusIcon = success ? '✓' : '✗';
  const statusTitle = success ? 'Connected Successfully!' : 'Connection Failed';

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>GoHighLevel Connection</title></head>
      <body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px; background: #f8fafc;">
        <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: ${statusColor}; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">
            ${statusIcon}
          </div>
          <h2 style="color: ${statusColor}; margin: 0 0 8px;">${statusTitle}</h2>
          <p style="color: #64748b; margin: 0 0 24px;">${message}</p>
          <p style="color: #94a3b8; font-size: 14px;">This window will close automatically...</p>
        </div>
        <script>
          // Notify the opener window
          if (window.opener) {
            window.opener.postMessage({
              type: '${success ? 'oauth_success' : 'oauth_error'}',
              integration: 'gohighlevel',
              ${success ? `credentials: { locationId: '${locationId || ''}' },` : ''}
              ${success ? `agentId: '${agentId || ''}',` : ''}
              message: '${message.replace(/'/g, "\\'")}'
            }, '*');
            // Close after a brief delay so user sees the success message
            setTimeout(() => window.close(), 1500);
          } else {
            // If not in a popup, redirect back to the agent page
            ${success && agentId ? `setTimeout(() => window.location.href = '/agents/${agentId}?tab=integrations&connected=gohighlevel', 2000);` : ''}
          }
        </script>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
