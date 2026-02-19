/**
 * OAuth Token Refresh Service
 * Handles automatic refresh of expired OAuth tokens for HubSpot and Salesforce
 */

interface TokenRefreshResult {
  success: boolean;
  access_token?: string;
  expires_at?: string;
  error?: string;
}

/**
 * Refresh HubSpot access token using refresh token
 */
export async function refreshHubSpotToken(refreshToken: string): Promise<TokenRefreshResult> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      success: false,
      error: 'HubSpot OAuth credentials not configured'
    };
  }

  try {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[HubSpot] Token refresh failed:', error);
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      };
    }

    const data = await response.json();

    return {
      success: true,
      access_token: data.access_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    };
  } catch (error: any) {
    console.error('[HubSpot] Token refresh error:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error during token refresh'
    };
  }
}

/**
 * Refresh Salesforce access token using refresh token
 */
export async function refreshSalesforceToken(refreshToken: string): Promise<TokenRefreshResult> {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      success: false,
      error: 'Salesforce OAuth credentials not configured'
    };
  }

  try {
    const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Salesforce] Token refresh failed:', error);
      return {
        success: false,
        error: error.error_description || 'Token refresh failed'
      };
    }

    const data = await response.json();

    return {
      success: true,
      access_token: data.access_token,
      // Salesforce doesn't return expires_in, tokens are long-lived
      // We'll set a conservative 2-hour expiry
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };
  } catch (error: any) {
    console.error('[Salesforce] Token refresh error:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error during token refresh'
    };
  }
}

/**
 * Refresh GoHighLevel access token using refresh token
 * IMPORTANT: GHL refresh tokens are single-use. Each refresh returns a NEW refresh token.
 * We must store the new refresh_token every time.
 */
export async function refreshGHLToken(refreshToken: string): Promise<TokenRefreshResult & { refresh_token?: string }> {
  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      success: false,
      error: 'GHL OAuth credentials not configured'
    };
  }

  try {
    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        user_type: 'Location',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[GHL] Token refresh failed:', response.status, error);
      return {
        success: false,
        error: error.message || error.error_description || 'Token refresh failed'
      };
    }

    const data = await response.json();

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token, // NEW refresh token — must store this!
      expires_at: new Date(Date.now() + (data.expires_in || 86399) * 1000).toISOString()
    };
  } catch (error: any) {
    console.error('[GHL] Token refresh error:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error during token refresh'
    };
  }
}

/**
 * Update integration connection with new token
 */
export async function updateIntegrationToken(
  integrationId: string,
  accessToken: string,
  expiresAt?: string,
  refreshToken?: string
): Promise<boolean> {
  // Use service client to avoid cookie dependency (works in webhooks & cron)
  const { createServiceClient } = await import('@/lib/supabase/client');
  const supabase = createServiceClient();

  const updateData: any = {
    access_token: accessToken,
    connection_status: 'connected',
    last_error: null,
    updated_at: new Date().toISOString()
  };

  if (expiresAt) {
    updateData.token_expires_at = expiresAt;
  }

  // GHL returns a new single-use refresh token on every refresh
  if (refreshToken) {
    updateData.refresh_token = refreshToken;
  }

  const { error } = await supabase
    .from('integration_connections')
    .update(updateData)
    .eq('id', integrationId);

  if (error) {
    console.error('[OAuth] Failed to update token:', error);
    return false;
  }

  return true;
}

/**
 * Check if token needs refresh and refresh if necessary
 */
export async function ensureValidToken(
  integrationId: string,
  integrationType: 'hubspot' | 'salesforce' | 'gohighlevel'
): Promise<string | null> {
  // Use service client to avoid cookie dependency
  const { createServiceClient } = await import('@/lib/supabase/client');
  const supabase = createServiceClient();

  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('id', integrationId)
    .single();

  if (error || !connection) {
    console.error('[OAuth] Failed to fetch connection:', error);
    return null;
  }

  // Check if token is expired or will expire in next 5 minutes
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (!expiresAt || expiresAt < fiveMinutesFromNow) {
    // Token expired or expiring soon — refresh it
    console.log(`[OAuth] Refreshing ${integrationType} token for integration ${integrationId}`);

    if (!connection.refresh_token) {
      console.error(`[OAuth] No refresh token available for ${integrationType}`);
      return null;
    }

    let refreshResult: TokenRefreshResult & { refresh_token?: string };

    if (integrationType === 'gohighlevel') {
      refreshResult = await refreshGHLToken(connection.refresh_token);
    } else if (integrationType === 'hubspot') {
      refreshResult = await refreshHubSpotToken(connection.refresh_token);
    } else {
      refreshResult = await refreshSalesforceToken(connection.refresh_token);
    }

    if (!refreshResult.success) {
      console.error(`[OAuth] Failed to refresh ${integrationType} token:`, refreshResult.error);

      // Mark connection as having an error
      await supabase
        .from('integration_connections')
        .update({
          connection_status: 'error',
          last_error: `Token refresh failed: ${refreshResult.error}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', integrationId);

      return null;
    }

    // Update database with new tokens
    // For GHL, we MUST also store the new refresh token (single-use)
    await updateIntegrationToken(
      integrationId,
      refreshResult.access_token!,
      refreshResult.expires_at,
      refreshResult.refresh_token // New refresh token for GHL
    );

    return refreshResult.access_token!;
  }

  // Token still valid
  return connection.access_token;
}
