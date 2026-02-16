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
 * Update integration connection with new token
 */
export async function updateIntegrationToken(
  integrationId: string,
  accessToken: string,
  expiresAt?: string
): Promise<boolean> {
  const { createServerClient } = await import('@/lib/supabase/server');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const updateData: any = {
    access_token: accessToken,
    updated_at: new Date().toISOString()
  };

  if (expiresAt) {
    updateData.token_expires_at = expiresAt;
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
  integrationType: 'hubspot' | 'salesforce'
): Promise<string | null> {
  const { createServerClient } = await import('@/lib/supabase/server');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

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
    // Token expired or expiring soon - refresh it
    console.log(`[OAuth] Refreshing ${integrationType} token for integration ${integrationId}`);

    const refreshResult = integrationType === 'hubspot'
      ? await refreshHubSpotToken(connection.refresh_token)
      : await refreshSalesforceToken(connection.refresh_token);

    if (!refreshResult.success) {
      console.error(`[OAuth] Failed to refresh ${integrationType} token:`, refreshResult.error);
      return null;
    }

    // Update database with new token
    await updateIntegrationToken(
      integrationId,
      refreshResult.access_token!,
      refreshResult.expires_at
    );

    return refreshResult.access_token!;
  }

  // Token still valid
  return connection.access_token;
}
