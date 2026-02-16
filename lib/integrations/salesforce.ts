/**
 * Salesforce Integration
 * OAuth 2.0 authentication
 * Enterprise CRM: Leads, Contacts, Tasks, Events
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class SalesforceIntegration extends BaseIntegration {
  private accessToken: string;
  private instanceUrl: string;

  constructor(connection: any) {
    super(connection);
    this.accessToken = connection.access_token || '';
    this.instanceUrl = connection.instance_url || '';
  }

  getType(): IntegrationType {
    return 'salesforce';
  }

  getName(): string {
    return 'Salesforce';
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
        console.log('[Salesforce] Demo mode enabled - skipping validation');
        return { success: true, data: true };
      }

      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return { success: true, data: true };
      }

      return {
        success: false,
        error: 'Invalid access token or instance URL',
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

      const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.SALESFORCE_CLIENT_ID!,
          client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
          refresh_token: this.connection.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();

      // Update connection in database
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      await supabase
        .from('integration_connections')
        .update({
          access_token: tokens.access_token,
          instance_url: tokens.instance_url,
        })
        .eq('id', this.connection.id);

      // Update local connection
      this.connection.access_token = tokens.access_token;
      this.connection.instance_url = tokens.instance_url;
      this.accessToken = tokens.access_token;
      this.instanceUrl = tokens.instance_url;

      return true;
    } catch (error) {
      console.error('[Salesforce] Token refresh failed:', error);
      return false;
    }
  }

  // ==================== Contact Management ====================
  // Salesforce has both Leads and Contacts
  // We'll create as Lead by default, can be converted later

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      await this.rateLimit();

      const nameParts = (data.name || '').split(' ');
      const firstName = data.firstName || nameParts[0] || '';
      const lastName = data.lastName || nameParts.slice(1).join(' ') || 'Unknown';

      // Decide: Create as Lead or Contact
      const objectType = this.connection.config?.create_as || 'Lead';

      const payload: any = {
        FirstName: firstName,
        LastName: lastName,
        Email: data.email || null,
        Phone: data.phone || null,
        Company: data.company || 'Unknown',
        Street: data.address || null,
      };

      // Apply custom field mappings
      if (data.customFields && this.connection.config?.field_mappings) {
        const mappedFields = this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        );
        Object.assign(payload, mappedFields);
      }

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/${objectType}/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Salesforce API error: ${errorData[0]?.message || response.statusText}`);
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

      const objectType = this.connection.config?.create_as || 'Lead';

      const payload: any = {};

      if (data.firstName) payload.FirstName = data.firstName;
      if (data.lastName) payload.LastName = data.lastName;
      if (data.email) payload.Email = data.email;
      if (data.phone) payload.Phone = data.phone;
      if (data.company) payload.Company = data.company;
      if (data.address) payload.Street = data.address;

      if (data.customFields && this.connection.config?.field_mappings) {
        Object.assign(payload, this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        ));
      }

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/${objectType}/${contactId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Salesforce API error: ${errorData[0]?.message || response.statusText}`);
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

      const objectType = this.connection.config?.create_as || 'Lead';

      let query = `SELECT Id FROM ${objectType} WHERE `;

      if (email) {
        query += `Email = '${email.replace(/'/g, "\\'")}'`;
      } else if (phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        query += `Phone LIKE '%${normalizedPhone}%'`;
      }

      query += ' LIMIT 1';

      const encodedQuery = encodeURIComponent(query);

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/query/?q=${encodedQuery}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.records && result.records.length > 0) {
        return {
          success: true,
          data: { contactId: result.records[0].Id }
        };
      }

      return { success: true, data: null };
    } catch (error: any) {
      return this.handleError(error, 'findContact');
    }
  }

  // ==================== Notes (Tasks) ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    try {
      await this.rateLimit();

      const objectType = this.connection.config?.create_as || 'Lead';

      // Create Task associated with Lead/Contact
      const payload = {
        WhoId: data.contactId, // Links to Lead or Contact
        Subject: data.subject || 'Call Note',
        Description: data.content,
        Status: 'Completed',
        ActivityDate: data.timestamp.toISOString().split('T')[0], // Date only
      };

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Task/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Salesforce API error: ${errorData[0]?.message || response.statusText}`);
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

  // ==================== Events (Appointments) ====================

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
        WhoId: data.contactId, // Lead or Contact
        Subject: data.title,
        Description: data.description || '',
        Location: data.location || '',
        StartDateTime: startDateTime.toISOString(),
        EndDateTime: endDateTime.toISOString(),
      };

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Event/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Salesforce API error: ${errorData[0]?.message || response.statusText}`);
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

  // ==================== Opportunities ====================

  async createOpportunity(contactId: string, opportunityName: string, amount?: number, stage?: string): Promise<IntegrationResponse<{ opportunityId: string }>> {
    try {
      await this.rateLimit();

      const closeDate = new Date();
      closeDate.setDate(closeDate.getDate() + 30); // 30 days from now

      const payload = {
        Name: opportunityName,
        Amount: amount || 0,
        StageName: stage || this.connection.config?.default_stage || 'Prospecting',
        CloseDate: closeDate.toISOString().split('T')[0],
        // Associate with Contact (requires AccountId usually)
      };

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Salesforce API error: ${errorData[0]?.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { opportunityId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createOpportunity');
    }
  }

  // ==================== OAuth Helpers ====================

  static generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/salesforce/callback`,
      state,
      scope: 'full refresh_token',
    });

    return `https://login.salesforce.com/services/oauth2/authorize?${params.toString()}`;
  }

  static async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    instance_url: string;
  }> {
    const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/salesforce/callback`,
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
      instance_url: tokens.instance_url,
    };
  }

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // Salesforce rate limits: Varies by edition, typically 15,000-100,000 per day
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}
