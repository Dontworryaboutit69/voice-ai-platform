/**
 * HubSpot Integration
 * OAuth 2.0 authentication
 * Full CRM: contacts, deals, notes, meetings
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';
import { ensureValidToken } from '@/lib/services/oauth-token-refresh.service';
import type { SupabaseClient } from '@supabase/supabase-js';

export class HubSpotIntegration extends BaseIntegration {
  private baseUrl = 'https://api.hubapi.com';
  private accessToken: string;
  private supabaseClient?: SupabaseClient;

  constructor(connection: any, supabaseClient?: SupabaseClient) {
    super(connection);
    this.accessToken = connection.access_token || '';
    this.supabaseClient = supabaseClient;
  }

  /**
   * Ensure we have a valid access token before making API calls
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.connection.config?.demo_mode || this.accessToken === 'demo_token') {
      return; // Skip refresh in demo mode
    }

    // Skip token refresh if using external Supabase client (e.g., in test scripts)
    // In this case, the caller is responsible for ensuring the token is valid
    if (this.supabaseClient) {
      return;
    }

    const newToken = await ensureValidToken(this.connection.id, 'hubspot');
    if (newToken && newToken !== this.accessToken) {
      this.accessToken = newToken;
    }
  }

  getType(): IntegrationType {
    return 'hubspot';
  }

  getName(): string {
    return 'HubSpot';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      // Demo mode - skip validation
      if (this.connection.config?.demo_mode || this.accessToken === 'demo_token') {
        console.log('[HubSpot] Demo mode enabled - skipping validation');
        return { success: true, data: true };
      }

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts?limit=1`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return { success: true, data: true };
      }

      return {
        success: false,
        error: 'Invalid access token',
        errorCode: 'AUTH_ERROR'
      };
    } catch (error: any) {
      return this.handleError(error, 'validateConnection');
    }
  }

  protected async refreshOAuthToken(): Promise<boolean> {
    try {
      if (!this.connection.refresh_token) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.HUBSPOT_CLIENT_ID!,
          client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
          refresh_token: this.connection.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

      // Update connection in database
      // Use provided Supabase client (for scripts) or create new one (for API routes)
      let supabase: SupabaseClient;
      if (this.supabaseClient) {
        supabase = this.supabaseClient;
      } else {
        const { createClient } = await import('@/lib/supabase/server');
        supabase = await createClient();
      }

      await supabase
        .from('integration_connections')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', this.connection.id);

      // Update local connection
      this.connection.access_token = tokens.access_token;
      this.connection.refresh_token = tokens.refresh_token;
      this.connection.token_expires_at = expiresAt;
      this.accessToken = tokens.access_token;

      return true;
    } catch (error) {
      console.error('[HubSpot] Token refresh failed:', error);
      return false;
    }
  }

  // ==================== Contact Management ====================

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      await this.rateLimit();

      const properties: any = {
        firstname: data.firstName || data.name?.split(' ')[0] || '',
        lastname: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
      };

      // Apply custom field mappings
      if (data.customFields && this.connection.config?.field_mappings) {
        const mappedFields = this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        );
        Object.assign(properties, mappedFields);
      }

      const payload = {
        properties,
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { contactId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createContact');
    }
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    try {
      await this.rateLimit();

      const properties: any = {};

      if (data.firstName) properties.firstname = data.firstName;
      if (data.lastName) properties.lastname = data.lastName;
      if (data.email) properties.email = data.email;
      if (data.phone) properties.phone = data.phone;
      if (data.address) properties.address = data.address;
      if (data.company) properties.company = data.company;

      if (data.customFields && this.connection.config?.field_mappings) {
        Object.assign(properties, this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        ));
      }

      const payload = { properties };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'updateContact');
    }
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    try {
      await this.rateLimit();

      if (!email && !phone) {
        return { success: true, data: null };
      }

      // Build search filter
      const filterGroups = [];

      if (email) {
        filterGroups.push({
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        });
      }

      if (phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        filterGroups.push({
          filters: [{
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
            value: normalizedPhone
          }]
        });
      }

      const payload = {
        filterGroups,
        limit: 1,
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.results && result.results.length > 0) {
        return {
          success: true,
          data: { contactId: result.results[0].id }
        };
      }

      return { success: true, data: null };
    } catch (error: any) {
      return this.handleError(error, 'findContact');
    }
  }

  // ==================== Notes (Engagements) ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    try {
      await this.rateLimit();

      const payload = {
        properties: {
          hs_timestamp: data.timestamp.getTime(),
          hs_note_body: data.content,
        },
        associations: [
          {
            to: { id: data.contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 202 // Note to Contact
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/notes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { noteId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'addNote');
    }
  }

  // ==================== Meetings (Appointments) ====================

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    try {
      await this.rateLimit();

      // Parse date and time
      const [year, month, day] = data.date.split('-').map(Number);
      const [hour, minute] = data.time.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, hour, minute);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + data.durationMinutes);

      const payload = {
        properties: {
          hs_meeting_title: data.title,
          hs_meeting_body: data.description || '',
          hs_meeting_start_time: startDateTime.toISOString(),
          hs_meeting_end_time: endDateTime.toISOString(),
          hs_meeting_location: data.location || '',
        },
        associations: data.contactId ? [
          {
            to: { id: data.contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 200 // Meeting to Contact
              }
            ]
          }
        ] : []
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/meetings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { appointmentId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  // ==================== Workflows ====================

  async triggerWorkflow(workflowId: string, contactId: string, data?: Record<string, any>): Promise<IntegrationResponse<void>> {
    try {
      await this.rateLimit();

      // HubSpot workflows are triggered by enrollment
      const payload = {
        inputs: [
          {
            objectId: contactId,
            objectType: 'CONTACT'
          }
        ]
      };

      const response = await fetch(
        `${this.baseUrl}/automation/v4/workflows/${workflowId}/enrollments/contacts/enroll`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'triggerWorkflow');
    }
  }

  // ==================== Deals/Opportunities ====================

  async createDeal(contactId: string, dealName: string, amount?: number, stage?: string): Promise<IntegrationResponse<{ dealId: string }>> {
    try {
      await this.rateLimit();

      const pipelineId = this.connection.config?.pipeline_id;
      const stageId = stage || this.connection.config?.default_stage_id;

      const payload = {
        properties: {
          dealname: dealName,
          amount: amount || 0,
          pipeline: pipelineId,
          dealstage: stageId,
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 3 // Deal to Contact
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { dealId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createDeal');
    }
  }

  // ==================== OAuth Helpers ====================

  static generateAuthUrl(state: string): string {
    const scopes = [
      'crm.objects.contacts.write',
      'crm.objects.contacts.read',
      'crm.objects.deals.write',
      'crm.objects.deals.read',
      'crm.schemas.contacts.read',
      'crm.schemas.deals.read',
    ];

    const params = new URLSearchParams({
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`,
      scope: scopes.join(' '),
      state,
    });

    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    };
  }

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // HubSpot rate limits: 100 requests per 10 seconds (per API key)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
