import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

/**
 * Webhook handler for GoHighLevel events
 * Receives INSTALL, UNINSTALL, and other lifecycle events
 *
 * Configured in GHL Marketplace > Advanced Settings > Webhooks
 * URL: https://voice-ai-platform-phi.vercel.app/api/integrations/webhooks/crm
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.type || body.event || 'unknown';

    console.log('[GHL Webhook] Received event:', eventType, JSON.stringify(body).substring(0, 500));

    const supabase = createServiceClient();

    switch (eventType) {
      case 'INSTALL':
      case 'install': {
        // App was installed by a GHL user
        const locationId = body.locationId || body.location_id;
        const companyId = body.companyId || body.company_id;
        console.log(`[GHL Webhook] App installed for location: ${locationId}, company: ${companyId}`);

        // Log the installation event
        try {
          await supabase.from('integration_sync_logs').insert({
            operation_type: 'app_install',
            direction: 'inbound',
            status: 'success',
            request_payload: body,
            completed_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('[GHL Webhook] Could not log install event:', e);
        }

        break;
      }

      case 'UNINSTALL':
      case 'uninstall': {
        // App was uninstalled — deactivate the connection
        const locationId = body.locationId || body.location_id;
        console.log(`[GHL Webhook] App uninstalled for location: ${locationId}`);

        if (locationId) {
          // Find and deactivate the connection for this location
          const { data: connections } = await supabase
            .from('integration_connections')
            .select('id')
            .eq('integration_type', 'gohighlevel')
            .eq('auth_type', 'oauth')
            .filter('config->>location_id', 'eq', locationId);

          if (connections && connections.length > 0) {
            for (const conn of connections) {
              await supabase
                .from('integration_connections')
                .update({
                  is_active: false,
                  connection_status: 'disconnected',
                  access_token: null,
                  refresh_token: null,
                  last_error: 'App uninstalled by user',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', conn.id);

              console.log(`[GHL Webhook] Deactivated connection: ${conn.id}`);
            }
          }
        }

        break;
      }

      case 'ContactCreate':
      case 'ContactUpdate':
      case 'AppointmentCreate':
      case 'AppointmentUpdate':
      case 'AppointmentDelete': {
        // These are informational — we can use them for sync later
        console.log(`[GHL Webhook] ${eventType} event received for location: ${body.locationId}`);
        break;
      }

      default:
        console.log(`[GHL Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true, received: eventType });
  } catch (error: any) {
    console.error('[GHL Webhook] Error processing webhook:', error);
    // Return 200 even on error to prevent GHL from retrying
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

// Also handle GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: 'ok', handler: 'ghl-webhook' });
}
