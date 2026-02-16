/**
 * Calendly Integration
 * OAuth 2.0 authentication
 * Check availability and book appointments via Calendly
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class CalendlyIntegration extends BaseIntegration {
  private baseUrl = 'https://api.calendly.com';
  private accessToken: string;

  constructor(connection: any) {
    super(connection);
    this.accessToken = connection.access_token || '';
  }

  getType(): IntegrationType {
    return 'calendly';
  }

  getName(): string {
    return 'Calendly';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
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

      const response = await fetch('https://auth.calendly.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.CALENDLY_CLIENT_ID!,
          client_secret: process.env.CALENDLY_CLIENT_SECRET!,
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

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

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
      console.error('[Calendly] Token refresh failed:', error);
      return false;
    }
  }

  // ==================== Contact Management ====================
  // Calendly doesn't manage contacts directly
  // Invitees are created when booking appointments

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    // Calendly creates invitees during booking, not as standalone contacts
    return {
      success: true,
      data: { contactId: `calendly_${data.email || data.phone}` }
    };
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    return { success: true };
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    return {
      success: true,
      data: email ? { contactId: `calendly_${email}` } : null
    };
  }

  // ==================== Notes ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    // Calendly doesn't have a notes API
    return {
      success: true,
      data: { noteId: `note_${Date.now()}` }
    };
  }

  // ==================== Event Types ====================

  /**
   * Get available event types (booking pages)
   */
  async getEventTypes(): Promise<IntegrationResponse<any[]>> {
    try {
      // Get current user
      const userResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getHeaders(),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const userUri = userData.resource.uri;

      // Get event types for user
      const response = await fetch(`${this.baseUrl}/event_types?user=${userUri}&active=true`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.collection || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getEventTypes');
    }
  }

  // ==================== Availability ====================

  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    try {
      const eventTypeUri = this.connection.config?.event_type_uri;

      if (!eventTypeUri) {
        return {
          success: false,
          error: 'No event type configured',
          errorCode: 'CONFIG_ERROR'
        };
      }

      // Get event type details
      const eventTypeResponse = await fetch(`${this.baseUrl}${eventTypeUri}`, {
        headers: this.getHeaders(),
      });

      if (!eventTypeResponse.ok) {
        throw new Error('Failed to get event type');
      }

      const eventTypeData = await eventTypeResponse.json();
      const eventType = eventTypeData.resource;

      // Get available times
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      const response = await fetch(
        `${this.baseUrl}/event_type_available_times?event_type=${eventTypeUri}&start_time=${startTime.toISOString()}&end_time=${endTime.toISOString()}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Calendly API error: ${response.statusText}`);
      }

      const result = await response.json();
      const availableTimes = result.collection || [];

      // Extract time slots
      const availableSlots = availableTimes.map((slot: any) => {
        const startDate = new Date(slot.start_time);
        const hour = startDate.getHours().toString().padStart(2, '0');
        const minute = startDate.getMinutes().toString().padStart(2, '0');
        return `${hour}:${minute}`;
      });

      return {
        success: true,
        data: { availableSlots }
      };
    } catch (error: any) {
      return this.handleError(error, 'checkAvailability');
    }
  }

  // ==================== Appointments ====================

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    try {
      const eventTypeUri = this.connection.config?.event_type_uri;

      if (!eventTypeUri) {
        return {
          success: false,
          error: 'No event type configured',
          errorCode: 'CONFIG_ERROR'
        };
      }

      // Parse date and time
      const [year, month, day] = data.date.split('-').map(Number);
      const [hour, minute] = data.time.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, hour, minute);

      // Extract email from contactId if it exists
      const email = data.contactId?.includes('@')
        ? data.contactId.replace('calendly_', '')
        : 'unknown@example.com';

      // Schedule event
      const payload = {
        event_type: eventTypeUri,
        start_time: startDateTime.toISOString(),
        invitee: {
          email: email,
          name: data.title.replace('Appointment with ', ''),
        },
        guests: [],
        location: data.location ? { location: data.location } : undefined,
        additional_info: data.description || '',
      };

      const response = await fetch(`${this.baseUrl}/scheduled_events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendly API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { appointmentId: result.resource.uri }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  // ==================== Webhooks ====================

  /**
   * Create webhook subscription for booking notifications
   */
  async createWebhook(webhookUrl: string, events: string[]): Promise<IntegrationResponse<{ webhookId: string }>> {
    try {
      // Get organization
      const userResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getHeaders(),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const organizationUri = userData.resource.current_organization;

      const payload = {
        url: webhookUrl,
        organization: organizationUri,
        scope: 'organization',
        events: events.length > 0 ? events : ['invitee.created', 'invitee.canceled'],
        signing_key: this.connection.webhook_secret || undefined,
      };

      const response = await fetch(`${this.baseUrl}/webhook_subscriptions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendly API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { webhookId: result.resource.uri }
      };
    } catch (error: any) {
      return this.handleError(error, 'createWebhook');
    }
  }

  // ==================== OAuth Helpers ====================

  static generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.CALENDLY_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/calendly/callback`,
      response_type: 'code',
      state,
    });

    return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.CALENDLY_CLIENT_ID!,
        client_secret: process.env.CALENDLY_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/calendly/callback`,
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
    // Calendly rate limits: 1000 requests per hour
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
