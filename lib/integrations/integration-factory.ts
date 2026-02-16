/**
 * Integration Factory
 * Creates the correct integration instance based on type
 */

import { BaseIntegration, IntegrationConnection, IntegrationType } from './base-integration';
import { GoogleCalendarIntegration } from './google-calendar';
import { CalendlyIntegration } from './calendly';
import { CalComIntegration } from './cal-com';
import { GoHighLevelIntegration } from './gohighlevel';
import { ZapierIntegration } from './zapier';
import { HousecallProIntegration } from './housecall-pro';
import { HubSpotIntegration } from './hubspot';
import { SalesforceIntegration } from './salesforce';
import { StripeIntegration } from './stripe-integration';

export class IntegrationFactory {
  /**
   * Create integration instance from connection record
   */
  static create(connection: IntegrationConnection): BaseIntegration {
    switch (connection.integration_type) {
      case 'google_calendar':
        return new GoogleCalendarIntegration(connection);

      case 'calendly':
        return new CalendlyIntegration(connection);

      case 'cal_com':
        return new CalComIntegration(connection);

      case 'gohighlevel':
        return new GoHighLevelIntegration(connection);

      case 'zapier':
        return new ZapierIntegration(connection);

      case 'housecall_pro':
        return new HousecallProIntegration(connection);

      case 'hubspot':
        return new HubSpotIntegration(connection);

      case 'salesforce':
        return new SalesforceIntegration(connection);

      case 'stripe':
        return new StripeIntegration(connection);

      default:
        throw new Error(`Unsupported integration type: ${connection.integration_type}`);
    }
  }

  /**
   * Get all available integration types
   */
  static getAvailableTypes(): IntegrationType[] {
    return [
      'google_calendar',
      'calendly',
      'cal_com',
      'gohighlevel',
      'zapier',
      'housecall_pro',
      'hubspot',
      'salesforce',
      'stripe',
    ];
  }

  /**
   * Get integration metadata for UI
   */
  static getMetadata(type: IntegrationType): {
    name: string;
    description: string;
    authType: 'oauth' | 'api_key' | 'webhook';
    icon: string;
    setupUrl?: string;
    features: string[];
  } {
    const metadata = {
      google_calendar: {
        name: 'Google Calendar',
        description: 'Check availability and book appointments in Google Calendar',
        authType: 'oauth' as const,
        icon: '📅',
        setupUrl: 'https://console.cloud.google.com/apis/credentials',
        features: [
          'Check calendar availability',
          'Book appointments',
          'Send email invitations',
          'Multiple calendar support',
        ],
      },
      gohighlevel: {
        name: 'GoHighLevel',
        description: 'Full CRM integration with contacts, notes, appointments, and workflows',
        authType: 'api_key' as const,
        icon: '🚀',
        setupUrl: 'https://app.gohighlevel.com/settings/integrations',
        features: [
          'Contact management',
          'Call notes with recordings',
          'Calendar appointments',
          'Workflow triggering',
          'Pipeline management',
          'Custom field mapping',
        ],
      },
      zapier: {
        name: 'Zapier',
        description: 'Connect to 5,000+ apps via webhook',
        authType: 'webhook' as const,
        icon: '⚡',
        setupUrl: 'https://zapier.com/app/zaps',
        features: [
          'Send call data to any app',
          'Unlimited automation possibilities',
          'Custom data transformations',
          'Multi-step workflows',
        ],
      },
      housecall_pro: {
        name: 'Housecall Pro',
        description: 'Home services CRM with customers, jobs, and scheduling',
        authType: 'api_key' as const,
        icon: '🏠',
        setupUrl: 'https://pro.housecallpro.com/settings/integrations',
        features: [
          'Customer management',
          'Job creation',
          'Dispatch scheduling',
          'Service notes',
        ],
      },
      hubspot: {
        name: 'HubSpot',
        description: 'Enterprise CRM with contacts, deals, meetings, and workflows',
        authType: 'oauth' as const,
        icon: '🎯',
        setupUrl: 'https://developers.hubspot.com/',
        features: [
          'Contact management',
          'Deal/opportunity tracking',
          'Meeting scheduling',
          'Notes and engagements',
          'Workflow enrollment',
          'Custom field mapping',
        ],
      },
      salesforce: {
        name: 'Salesforce',
        description: 'Enterprise CRM with leads, contacts, tasks, and opportunities',
        authType: 'oauth' as const,
        icon: '☁️',
        setupUrl: 'https://developer.salesforce.com/',
        features: [
          'Lead/Contact management',
          'Task creation',
          'Event scheduling',
          'Opportunity tracking',
          'Custom field mapping',
        ],
      },
      calendly: {
        name: 'Calendly',
        description: 'Professional scheduling platform with availability checking',
        authType: 'oauth' as const,
        icon: '📆',
        setupUrl: 'https://developer.calendly.com/',
        features: [
          'Check availability',
          'Book appointments',
          'Event type management',
          'Webhook notifications',
          'Automatic email confirmations',
        ],
      },
      cal_com: {
        name: 'Cal.com',
        description: 'Open-source scheduling infrastructure',
        authType: 'api_key' as const,
        icon: '📅',
        setupUrl: 'https://cal.com/docs/api',
        features: [
          'Check availability',
          'Book appointments',
          'Multiple event types',
          'Webhook support',
          'Custom branding',
        ],
      },
      stripe: {
        name: 'Stripe',
        description: 'Payment processing and customer billing',
        authType: 'api_key' as const,
        icon: '💳',
        setupUrl: 'https://dashboard.stripe.com/apikeys',
        features: [
          'Customer management',
          'Payment processing',
          'Invoice creation',
          'Payment links',
          'Subscription management',
          'Webhook notifications',
        ],
      },
    };

    return metadata[type];
  }

  /**
   * Validate integration configuration
   */
  static validateConfig(type: IntegrationType, config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'google_calendar':
        // OAuth - no config validation needed
        break;

      case 'gohighlevel':
        if (!config.location_id) {
          errors.push('location_id is required for GoHighLevel');
        }
        break;

      case 'zapier':
        // Webhook URL validated separately
        break;

      case 'housecall_pro':
        if (!config.company_id) {
          errors.push('company_id is required for Housecall Pro');
        }
        break;

      case 'hubspot':
        // OAuth - no config validation needed
        break;

      case 'salesforce':
        // OAuth - no config validation needed
        if (config.create_as && !['Lead', 'Contact'].includes(config.create_as)) {
          errors.push('create_as must be either "Lead" or "Contact"');
        }
        break;

      case 'calendly':
        // OAuth - event type should be configured
        if (!config.event_type_uri) {
          errors.push('event_type_uri is required for Calendly');
        }
        break;

      case 'cal_com':
        // API key - event type should be configured
        if (!config.event_type_id) {
          errors.push('event_type_id is required for Cal.com');
        }
        break;

      case 'stripe':
        // API key - no config validation needed
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get required scopes for OAuth integrations
   */
  static getOAuthScopes(type: IntegrationType): string[] | null {
    switch (type) {
      case 'google_calendar':
        return [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ];

      case 'hubspot':
        return [
          'crm.objects.contacts.write',
          'crm.objects.contacts.read',
          'crm.objects.deals.write',
          'crm.objects.deals.read',
          'crm.schemas.contacts.read',
          'crm.schemas.deals.read',
        ];

      case 'salesforce':
        return ['full', 'refresh_token'];

      case 'calendly':
        return []; // Calendly doesn't use scopes in URL

      default:
        return null; // Not an OAuth integration
    }
  }
}

/**
 * Helper: Get integration instance from database
 */
export async function getIntegrationInstance(
  integrationId: string
): Promise<BaseIntegration | null> {
  const { createServerClient } = await import('@/lib/supabase/server');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error || !connection) {
    console.error('[IntegrationFactory] Failed to fetch connection:', error);
    return null;
  }

  return IntegrationFactory.create(connection as IntegrationConnection);
}

/**
 * Helper: Get all active integrations for an agent
 */
export async function getAgentIntegrations(
  agentId: string
): Promise<BaseIntegration[]> {
  // Use service client for webhook context (bypasses cookies requirement)
  const { createServiceClient } = await import('@/lib/supabase/client');
  const supabase = createServiceClient();

  const { data: connections, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', agentId)
    .eq('is_active', true);

  if (error || !connections) {
    console.error('[IntegrationFactory] Failed to fetch connections:', error);
    return [];
  }

  return connections.map(connection =>
    IntegrationFactory.create(connection as IntegrationConnection)
  );
}

/**
 * Helper: Process call data through all integrations
 */
export async function processCallThroughIntegrations(
  agentId: string,
  callData: any
): Promise<void> {
  const integrations = await getAgentIntegrations(agentId);

  if (integrations.length === 0) {
    console.log(`[IntegrationFactory] No integrations configured for agent ${agentId}`);
    return;
  }

  console.log(`[IntegrationFactory] Processing call through ${integrations.length} integrations`);

  // Process all integrations in parallel
  const results = await Promise.allSettled(
    integrations.map(integration =>
      integration.processCallData(callData).catch(error => {
        console.error(`[IntegrationFactory] ${integration.getName()} failed:`, error);
        throw error;
      })
    )
  );

  // Log results
  results.forEach((result, index) => {
    const integration = integrations[index];
    if (result.status === 'fulfilled') {
      console.log(`[IntegrationFactory] ✅ ${integration.getName()} sync successful`);
    } else {
      console.error(`[IntegrationFactory] ❌ ${integration.getName()} sync failed:`, result.reason);
    }
  });

  // Store sync logs in database
  const { createServiceClient } = await import('@/lib/supabase/client');
  const supabase = createServiceClient();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const integration = integrations[i];

    const { data: connection } = await supabase
      .from('integration_connections')
      .select('id')
      .eq('agent_id', agentId)
      .eq('integration_type', integration.getType())
      .single();

    if (connection) {
      await supabase.from('integration_sync_logs').insert({
        integration_connection_id: connection.id,
        call_id: callData.callId,
        operation_type: 'create_note',
        direction: 'outbound',
        status: result.status === 'fulfilled' ? 'success' : 'failed',
        error_message: result.status === 'rejected' ? result.reason?.message : null,
        completed_at: new Date().toISOString(),
      });
    }
  }
}
