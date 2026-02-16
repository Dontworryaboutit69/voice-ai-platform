/**
 * Cal.com Integration
 * API Key authentication
 * Open-source scheduling platform with powerful API
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class CalComIntegration extends BaseIntegration {
  private baseUrl = 'https://api.cal.com/v1';
  private apiKey: string;

  constructor(connection: any) {
    super(connection);
    this.apiKey = connection.api_key || '';
  }

  getType(): IntegrationType {
    return 'cal_com';
  }

  getName(): string {
    return 'Cal.com';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return { success: true, data: true };
      }

      return {
        success: false,
        error: 'Invalid API key',
        errorCode: 'AUTH_ERROR'
      };
    } catch (error: any) {
      return this.handleError(error, 'validateConnection');
    }
  }

  // ==================== Contact Management ====================
  // Cal.com doesn't manage contacts separately
  // Guests are created during booking

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    return {
      success: true,
      data: { contactId: `calcom_${data.email || data.phone}` }
    };
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    return { success: true };
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    return {
      success: true,
      data: email ? { contactId: `calcom_${email}` } : null
    };
  }

  // ==================== Notes ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    // Cal.com doesn't have a notes API
    return {
      success: true,
      data: { noteId: `note_${Date.now()}` }
    };
  }

  // ==================== Event Types ====================

  /**
   * Get available event types
   */
  async getEventTypes(): Promise<IntegrationResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/event-types`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.event_types || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getEventTypes');
    }
  }

  // ==================== Availability ====================

  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    try {
      const eventTypeId = this.connection.config?.event_type_id;

      if (!eventTypeId) {
        return {
          success: false,
          error: 'No event type configured',
          errorCode: 'CONFIG_ERROR'
        };
      }

      // Get user info
      const userResponse = await fetch(`${this.baseUrl}/me`, {
        headers: this.getHeaders(),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const username = userData.username;

      // Get available slots
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      const response = await fetch(
        `${this.baseUrl}/slots/available?eventTypeId=${eventTypeId}&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&timeZone=${encodeURIComponent(timezone)}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      const result = await response.json();
      const slots = result.slots || {};

      // Extract time slots from the date key
      const dateKey = date;
      const availableTimes = slots[dateKey] || [];

      const availableSlots = availableTimes.map((slot: any) => {
        const startDate = new Date(slot.time);
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
      const eventTypeId = this.connection.config?.event_type_id;

      if (!eventTypeId) {
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
        ? data.contactId.replace('calcom_', '')
        : 'unknown@example.com';

      // Get event type details for duration
      const eventTypeResponse = await fetch(`${this.baseUrl}/event-types/${eventTypeId}`, {
        headers: this.getHeaders(),
      });

      if (!eventTypeResponse.ok) {
        throw new Error('Failed to get event type');
      }

      const eventTypeData = await eventTypeResponse.json();
      const eventType = eventTypeData.event_type;

      // Create booking
      const payload = {
        eventTypeId: parseInt(eventTypeId),
        start: startDateTime.toISOString(),
        responses: {
          name: data.title.replace('Appointment with ', ''),
          email: email,
          notes: data.description || '',
          location: data.location ? { value: data.location } : undefined,
        },
        timeZone: data.timezone,
        language: 'en',
        metadata: {
          source: 'voice-ai-platform',
        },
      };

      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cal.com API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { appointmentId: result.id || result.booking?.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  // ==================== Bookings Management ====================

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<IntegrationResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.booking
      };
    } catch (error: any) {
      return this.handleError(error, 'getBooking');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<IntegrationResponse<void>> {
    try {
      const payload = {
        id: parseInt(bookingId),
        cancellationReason: reason || 'Cancelled via Voice AI Platform',
      };

      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/cancel`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'cancelBooking');
    }
  }

  // ==================== Webhooks ====================

  /**
   * Create webhook for booking events
   */
  async createWebhook(webhookUrl: string, events: string[]): Promise<IntegrationResponse<{ webhookId: string }>> {
    try {
      const payload = {
        subscriberUrl: webhookUrl,
        eventTriggers: events.length > 0 ? events : ['BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED'],
        active: true,
        secret: this.connection.webhook_secret || undefined,
      };

      const response = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cal.com API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { webhookId: result.webhook.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createWebhook');
    }
  }

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<IntegrationResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/webhooks`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.webhooks || []
      };
    } catch (error: any) {
      return this.handleError(error, 'listWebhooks');
    }
  }

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // Cal.com rate limits: 10 requests per second
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
