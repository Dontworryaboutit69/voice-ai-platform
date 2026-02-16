/**
 * GoHighLevel (GHL) Integration
 * API Key authentication
 * Full CRM capabilities: contacts, notes, appointments, workflows
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class GoHighLevelIntegration extends BaseIntegration {
  private baseUrl = 'https://rest.gohighlevel.com/v1';
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
      'Version': '2021-07-28',
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
        email: data.email || '',
        phone: data.phone || '',
        address1: data.address || '',
        companyName: data.company || '',
      };

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

      let query = `locationId=${this.locationId}`;

      if (email) {
        query += `&email=${encodeURIComponent(email)}`;
      } else if (phone) {
        // Normalize phone for search
        const normalizedPhone = phone.replace(/\D/g, '');
        query += `&phone=${encodeURIComponent(normalizedPhone)}`;
      } else {
        return { success: true, data: null };
      }

      const response = await fetch(`${this.baseUrl}/contacts/?${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.contacts && result.contacts.length > 0) {
        return {
          success: true,
          data: { contactId: result.contacts[0].id }
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
        userId: this.connection.config?.user_id || undefined, // Optional: assign to specific user
      };

      const response = await fetch(`${this.baseUrl}/contacts/${data.contactId}/notes/`, {
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

      // Get appointments for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetch(
        `${this.baseUrl}/appointments/?calendarId=${calendarId}&startTime=${startOfDay.getTime()}&endTime=${endOfDay.getTime()}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const result = await response.json();
      const bookedAppointments = result.appointments || [];

      // Define business hours
      const businessStart = this.connection.config?.business_hours_start || 9;
      const businessEnd = this.connection.config?.business_hours_end || 17;
      const slotDuration = this.connection.config?.slot_duration_minutes || 60;

      // Generate all slots
      const allSlots: string[] = [];
      for (let hour = businessStart; hour < businessEnd; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }

      // Filter booked slots
      const availableSlots = allSlots.filter(slot => {
        const [hour, minute] = slot.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        return !bookedAppointments.some((apt: any) => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);

          return (
            (slotStart >= aptStart && slotStart < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotStart <= aptStart && slotEnd >= aptEnd)
          );
        });
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

      // Parse date and time
      // GHL requires RFC3339 format with timezone offset (e.g., 2026-02-12T13:42:44-05:00)

      // Calculate actual timezone offset for the specific date/time
      // This handles DST automatically
      const getTimezoneOffset = (dateStr: string, timeStr: string, tz: string): string => {
        try {
          // Create date string in the target timezone
          const dateTimeStr = `${dateStr}T${timeStr}:00`;
          const date = new Date(dateTimeStr + 'Z'); // Parse as UTC first

          // Format in target timezone and extract offset
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'longOffset'
          });

          const parts = formatter.formatToParts(date);
          const offsetPart = parts.find(p => p.type === 'timeZoneName');

          if (offsetPart && offsetPart.value) {
            // Extract offset from format like "GMT-05:00"
            const match = offsetPart.value.match(/GMT([+-]\d{2}):(\d{2})/);
            if (match) {
              return `${match[1]}:${match[2]}`;
            }
          }
        } catch (e) {
          console.error('[GHL] Error calculating timezone offset:', e);
        }

        // Fallback to static offsets if dynamic calculation fails
        const staticOffsets: Record<string, string> = {
          'America/New_York': '-05:00',
          'America/Chicago': '-06:00',
          'America/Denver': '-07:00',
          'America/Los_Angeles': '-08:00',
          'UTC': '+00:00'
        };
        return staticOffsets[tz] || '-05:00';
      };

      const tzOffset = getTimezoneOffset(data.date, data.time, data.timezone);

      // Format start time: YYYY-MM-DDTHH:MM:SS+TZ
      const selectedSlot = `${data.date}T${data.time}:00${tzOffset}`;

      // Calculate end time (add duration to start time)
      const [hour, minute] = data.time.split(':').map(Number);
      const endMinutes = minute + data.durationMinutes;
      const endHour = hour + Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;

      // Format end time
      const endTimeFormatted = `${data.date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00${tzOffset}`;

      const payload = {
        calendarId,
        contactId: data.contactId,
        selectedTimezone: data.timezone,
        selectedSlot: selectedSlot,
        startTime: selectedSlot,
        endTime: endTimeFormatted,
        title: data.title,
        appointmentStatus: 'confirmed',
        notes: data.description || '',
      };

      console.log('[GHL] Booking appointment with payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/appointments/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Appointment booking failed:', {
          status: response.status,
          statusText: response.statusText,
          payload,
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

  /**
   * Fetch all calendars for the location
   */
  async getCalendars(): Promise<IntegrationResponse<any[]>> {
    try {
      await this.rateLimit();

      // Try the calendar services endpoint first (more reliable)
      const response = await fetch(
        `${this.baseUrl}/calendars/services?locationId=${this.locationId}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        // If services endpoint fails, try the regular calendars endpoint
        console.log(`[GHL] Services endpoint failed (${response.status}), trying calendars endpoint...`);

        const fallbackResponse = await fetch(
          `${this.baseUrl}/calendars/?locationId=${this.locationId}`,
          { headers: this.getHeaders() }
        );

        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          console.error('[GHL] Both calendar endpoints failed:', {
            status: fallbackResponse.status,
            error: errorText.substring(0, 200)
          });
          throw new Error(`GHL API error: ${fallbackResponse.statusText}`);
        }

        const fallbackResult = await fallbackResponse.json();
        return {
          success: true,
          data: fallbackResult.calendars || []
        };
      }

      const result = await response.json();

      // Services endpoint returns 'services' instead of 'calendars'
      const calendars = result.services || result.calendars || [];

      return {
        success: true,
        data: calendars
      };
    } catch (error: any) {
      return this.handleError(error, 'getCalendars');
    }
  }

  // ==================== Pipeline Management ====================

  /**
   * Fetch all pipelines for the location
   */
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

  /**
   * Fetch stages for a specific pipeline
   */
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

  /**
   * Fetch all workflows for the location
   */
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

  /**
   * Add contact to pipeline/opportunity
   */
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

      // Only add stage if provided
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
    // Simple delay to avoid hitting limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
