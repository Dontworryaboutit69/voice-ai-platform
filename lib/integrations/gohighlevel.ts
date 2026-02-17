/**
 * GoHighLevel (GHL) Integration
 * Uses v2 API (services.leadconnectorhq.com)
 * Full CRM capabilities: contacts, notes, appointments, workflows
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class GoHighLevelIntegration extends BaseIntegration {
  private baseUrl = 'https://services.leadconnectorhq.com';
  private apiKey: string;
  private locationId: string;

  constructor(connection: any) {
    super(connection);
    this.apiKey = connection.api_key || '';
    this.locationId = connection.config?.location_id || '';
  }

  getType(): IntegrationType {
    return 'gohighlevel';
  }

  getName(): string {
    return 'GoHighLevel';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/locations/${this.locationId}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return { success: true, data: true };
      }

      return {
        success: false,
        error: 'Invalid API key or location ID',
        errorCode: 'AUTH_ERROR'
      };
    } catch (error: any) {
      return this.handleError(error, 'validateConnection');
    }
  }

  // ==================== Contact Management ====================

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      await this.rateLimit();

      const payload: any = {
        locationId: this.locationId,
        firstName: data.firstName || data.name?.split(' ')[0] || '',
        lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || undefined,
        phone: data.phone || undefined,
        address1: data.address || undefined,
        companyName: data.company || undefined,
        source: 'AI Voice Agent',
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      // Add custom fields if configured
      if (data.customFields && this.connection.config?.field_mappings) {
        const mappedFields = this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        );
        payload.customField = mappedFields;
      }

      const response = await fetch(`${this.baseUrl}/contacts/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Create contact failed:', response.status, errorText.substring(0, 300));
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { contactId: result.contact.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createContact');
    }
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    try {
      await this.rateLimit();

      const payload: any = {};

      if (data.firstName) payload.firstName = data.firstName;
      if (data.lastName) payload.lastName = data.lastName;
      if (data.email) payload.email = data.email;
      if (data.phone) payload.phone = data.phone;
      if (data.address) payload.address1 = data.address;
      if (data.company) payload.companyName = data.company;

      if (data.customFields && this.connection.config?.field_mappings) {
        payload.customField = this.applyFieldMappings(
          data.customFields,
          this.connection.config.field_mappings
        );
      }

      const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'updateContact');
    }
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    try {
      await this.rateLimit();

      // Use the v2 duplicate search endpoint
      let query = `locationId=${this.locationId}`;

      if (email) {
        query += `&email=${encodeURIComponent(email)}`;
      }
      if (phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        query += `&phone=${encodeURIComponent(normalizedPhone)}`;
      }

      if (!email && !phone) {
        return { success: true, data: null };
      }

      const response = await fetch(`${this.baseUrl}/contacts/search/duplicate?${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // If duplicate search fails, try regular contacts search
        const fallbackResponse = await fetch(`${this.baseUrl}/contacts/?${query}&limit=1`, {
          headers: this.getHeaders(),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`GHL API error: ${fallbackResponse.statusText}`);
        }

        const fallbackResult = await fallbackResponse.json();
        if (fallbackResult.contacts && fallbackResult.contacts.length > 0) {
          return {
            success: true,
            data: { contactId: fallbackResult.contacts[0].id }
          };
        }
        return { success: true, data: null };
      }

      const result = await response.json();

      if (result.contact && result.contact.id) {
        return {
          success: true,
          data: { contactId: result.contact.id }
        };
      }

      return { success: true, data: null };
    } catch (error: any) {
      return this.handleError(error, 'findContact');
    }
  }

  // ==================== Notes & Activities ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    try {
      await this.rateLimit();

      const payload = {
        contactId: data.contactId,
        body: data.content,
        userId: this.connection.config?.user_id || undefined,
      };

      const response = await fetch(`${this.baseUrl}/contacts/${data.contactId}/notes/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Add note failed:', response.status, errorText.substring(0, 300));
        throw new Error(`GHL API error: ${response.statusText}`);
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

  // ==================== Calendar & Appointments ====================

  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    try {
      await this.rateLimit();

      const calendarId = this.connection.config?.calendar_id;

      if (!calendarId) {
        return {
          success: false,
          error: 'No calendar ID configured',
          errorCode: 'CONFIG_ERROR'
        };
      }

      // Use v2 free-slots endpoint
      // startDate and endDate as epoch milliseconds
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const url = `${this.baseUrl}/calendars/${calendarId}/free-slots?startDate=${startOfDay.getTime()}&endDate=${endOfDay.getTime()}${timezone ? `&timezone=${encodeURIComponent(timezone)}` : ''}`;

      console.log('[GHL] Checking free slots:', url);

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Free slots failed:', response.status, errorText.substring(0, 500));
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[GHL] Free slots response keys:', Object.keys(result));

      // v2 free-slots returns: { "{date}": { "slots": ["2026-02-18T09:00:00-05:00", ...] } }
      // or { "slots": { "{date}": ["2026-02-18T09:00:00-05:00", ...] } }
      let rawSlots: string[] = [];

      if (result[date] && result[date].slots) {
        rawSlots = result[date].slots;
      } else if (result.slots) {
        // Try different response format
        if (Array.isArray(result.slots)) {
          rawSlots = result.slots;
        } else if (typeof result.slots === 'object') {
          // slots might be keyed by date
          const dateKey = Object.keys(result.slots).find(k => k.startsWith(date));
          if (dateKey) {
            rawSlots = result.slots[dateKey];
          }
        }
      } else {
        // Try to find slots in any date key
        for (const key of Object.keys(result)) {
          if (key.startsWith(date) || key === date) {
            const val = result[key];
            if (Array.isArray(val)) {
              rawSlots = val;
            } else if (val && val.slots) {
              rawSlots = val.slots;
            }
            break;
          }
        }
      }

      console.log(`[GHL] Found ${rawSlots.length} raw slots`);

      // Extract HH:MM from the ISO datetime strings
      const availableSlots = rawSlots.map(slot => {
        // slot is like "2026-02-18T09:00:00-05:00"
        const match = slot.match(/T(\d{2}):(\d{2})/);
        if (match) {
          return `${match[1]}:${match[2]}`;
        }
        return slot;
      });

      return {
        success: true,
        data: { availableSlots }
      };
    } catch (error: any) {
      return this.handleError(error, 'checkAvailability');
    }
  }

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    try {
      await this.rateLimit();

      const calendarId = this.connection.config?.calendar_id;

      if (!calendarId) {
        return {
          success: false,
          error: 'No calendar ID configured',
          errorCode: 'CONFIG_ERROR'
        };
      }

      // Build ISO start time
      const startDateTime = new Date(`${data.date}T${data.time}:00`).toISOString();

      const payload = {
        calendarId,
        locationId: this.locationId,
        contactId: data.contactId,
        startTime: startDateTime,
        title: data.title,
        appointmentStatus: 'confirmed',
        notes: data.description || '',
      };

      console.log('[GHL] Booking appointment with payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/calendars/events/appointments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Appointment booking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 500)
        });
        throw new Error(`GHL API error: ${response.statusText} - ${errorText.substring(0, 200)}`);
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

      const payload = {
        contactId,
        workflowId,
        eventData: data || {},
      };

      const response = await fetch(`${this.baseUrl}/workflows/${workflowId}/subscribe`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'triggerWorkflow');
    }
  }

  // ==================== Calendar Management ====================

  async getCalendars(): Promise<IntegrationResponse<any[]>> {
    try {
      await this.rateLimit();

      const response = await fetch(
        `${this.baseUrl}/calendars/?locationId=${this.locationId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Get calendars failed:', response.status, errorText.substring(0, 200));
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.calendars || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getCalendars');
    }
  }

  // ==================== Pipeline Management ====================

  async getPipelines(): Promise<IntegrationResponse<any[]>> {
    try {
      await this.rateLimit();

      const response = await fetch(
        `${this.baseUrl}/opportunities/pipelines?locationId=${this.locationId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.pipelines || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getPipelines');
    }
  }

  async getPipelineStages(pipelineId: string): Promise<IntegrationResponse<any[]>> {
    try {
      await this.rateLimit();

      const response = await fetch(
        `${this.baseUrl}/opportunities/pipelines/${pipelineId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.stages || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getPipelineStages');
    }
  }

  async getWorkflows(): Promise<IntegrationResponse<any[]>> {
    try {
      await this.rateLimit();

      const response = await fetch(
        `${this.baseUrl}/workflows/?locationId=${this.locationId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.workflows || []
      };
    } catch (error: any) {
      return this.handleError(error, 'getWorkflows');
    }
  }

  async addToPipeline(contactId: string, pipelineId: string, stageId?: string, value?: number): Promise<IntegrationResponse<{ opportunityId: string }>> {
    try {
      await this.rateLimit();

      const payload: any = {
        pipelineId,
        locationId: this.locationId,
        contactId,
        name: `Opportunity for ${contactId}`,
        status: 'open',
        monetaryValue: value || 0,
      };

      if (stageId) {
        payload.pipelineStageId = stageId;
      }

      const response = await fetch(`${this.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { opportunityId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'addToPipeline');
    }
  }

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // GHL has rate limits: 100 requests per 10 seconds
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
