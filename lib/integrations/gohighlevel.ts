/**
 * GoHighLevel (GHL) Integration
 * Uses v2 API (services.leadconnectorhq.com)
 * Full CRM capabilities: contacts, notes, appointments, workflows
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class GoHighLevelIntegration extends BaseIntegration {
  private baseUrlV2 = 'https://services.leadconnectorhq.com';
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
      const response = await fetch(`${this.baseUrlV2}/locations/${this.locationId}`, {
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

      console.log('[GHL] Creating contact via v2:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrlV2}/contacts/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Create contact failed:', response.status, errorText.substring(0, 300));
        throw new Error(`GHL API error ${response.status}: ${errorText.substring(0, 200)}`);
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

      const response = await fetch(`${this.baseUrlV2}/contacts/${contactId}`, {
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

      if (!email && !phone) {
        return { success: true, data: null };
      }

      // Try v2 search endpoint
      let searchUrl = `${this.baseUrlV2}/contacts/?locationId=${this.locationId}`;

      if (email) {
        searchUrl += `&query=${encodeURIComponent(email)}`;
      } else if (phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        searchUrl += `&query=${encodeURIComponent(normalizedPhone)}`;
      }

      console.log('[GHL] Finding contact via v2:', searchUrl);

      const response = await fetch(searchUrl, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Find contact failed:', response.status, errorText.substring(0, 300));
        // Don't throw — just return null so getOrCreateContact can create
        return { success: true, data: null };
      }

      const result = await response.json();

      if (result.contacts && result.contacts.length > 0) {
        console.log(`[GHL] Found existing contact: ${result.contacts[0].id}`);
        return {
          success: true,
          data: { contactId: result.contacts[0].id }
        };
      }

      console.log('[GHL] No existing contact found');
      return { success: true, data: null };
    } catch (error: any) {
      // Don't fail hard — return null so we can still create
      console.error('[GHL] findContact error (will try create):', error.message);
      return { success: true, data: null };
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

      console.log('[GHL] Adding note via v2 for contact:', data.contactId);

      const response = await fetch(`${this.baseUrlV2}/contacts/${data.contactId}/notes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GHL] Add note failed:', response.status, errorText.substring(0, 300));
        throw new Error(`GHL API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { noteId: result.id || result.note?.id || 'created' }
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

      // Try v2 free-slots endpoint first (works if token supports it)
      // Then fall back to v1 appointments listing
      let availableSlots: string[] = [];

      // Attempt 1: Try the free-slots endpoint via leadconnectorhq (v2)
      const freeSlotsUrl = `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${date}&endDate=${date}${timezone ? `&timezone=${encodeURIComponent(timezone)}` : ''}`;
      console.log('[GHL] Trying v2 free-slots:', freeSlotsUrl);

      const freeSlotsResponse = await fetch(freeSlotsUrl, {
        headers: this.getHeaders(),
      });

      if (freeSlotsResponse.ok) {
        const result = await freeSlotsResponse.json();
        console.log('[GHL] Free slots response keys:', Object.keys(result));

        // Parse slots from response — format varies
        let rawSlots: string[] = [];
        if (result[date] && Array.isArray(result[date].slots)) {
          rawSlots = result[date].slots;
        } else if (result.slots && Array.isArray(result.slots)) {
          rawSlots = result.slots;
        } else {
          // Try any date key in response
          for (const key of Object.keys(result)) {
            const val = result[key];
            if (Array.isArray(val?.slots)) { rawSlots = val.slots; break; }
            if (Array.isArray(val)) { rawSlots = val; break; }
          }
        }

        availableSlots = rawSlots.map(slot => {
          const match = slot.match(/T(\d{2}):(\d{2})/);
          return match ? `${match[1]}:${match[2]}` : slot;
        });

        console.log(`[GHL] v2 free-slots returned ${availableSlots.length} slots`);
      } else {
        // Attempt 2: Fall back to v1 — list appointments and compute available slots
        console.log(`[GHL] v2 free-slots failed (${freeSlotsResponse.status}), falling back to v1 approach`);

        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        // Try v2 appointments list endpoint with different date formats
        const v2Urls = [
          `${this.baseUrlV2}/calendars/events?locationId=${this.locationId}&calendarId=${calendarId}&startTime=${startOfDay.getTime()}&endTime=${endOfDay.getTime()}`,
          `${this.baseUrlV2}/calendars/events?locationId=${this.locationId}&calendarId=${calendarId}&startTime=${date}&endTime=${date}`,
        ];

        let bookedAppointments: any[] = [];
        let v1Success = false;

        for (const v2Url of v2Urls) {
          console.log('[GHL] Trying v2 events list:', v2Url);
          const v2Response = await fetch(v2Url, { headers: this.getHeaders() });
          if (v2Response.ok) {
            const v2Result = await v2Response.json();
            bookedAppointments = v2Result.events || v2Result.appointments || [];
            v1Success = true;
            console.log(`[GHL] v2 events returned ${bookedAppointments.length} existing appointments`);
            break;
          } else {
            console.log(`[GHL] v2 events attempt failed: ${v2Response.status}`);
          }
        }

        // Generate business hours slots and filter out booked ones
        const businessStart = this.connection.config?.business_hours_start || 9;
        const businessEnd = this.connection.config?.business_hours_end || 17;
        const slotDuration = this.connection.config?.slot_duration_minutes || 60;

        const allSlots: string[] = [];
        for (let hour = businessStart; hour < businessEnd; hour++) {
          for (let minute = 0; minute < 60; minute += slotDuration) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          }
        }

        if (v1Success && bookedAppointments.length > 0) {
          availableSlots = allSlots.filter(slot => {
            const [h, m] = slot.split(':').map(Number);
            const slotStart = new Date(`${date}T${slot}:00`);
            const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
            return !bookedAppointments.some((apt: any) => {
              const aptStart = new Date(apt.startTime || apt.start_time);
              const aptEnd = new Date(apt.endTime || apt.end_time || aptStart.getTime() + 3600000);
              return slotStart < aptEnd && slotEnd > aptStart;
            });
          });
        } else {
          // If we couldn't fetch appointments at all, return all business hours
          availableSlots = allSlots;
          if (!v1Success) {
            console.log('[GHL] Could not fetch appointments — returning all business hours as available');
          }
        }

        console.log(`[GHL] Computed ${availableSlots.length} available slots from ${allSlots.length} total`);
      }

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
      const endDateTime = new Date(
        new Date(`${data.date}T${data.time}:00`).getTime() + (data.durationMinutes || 30) * 60000
      ).toISOString();

      // GHL v2 appointment payload — includes both startTime/endTime and selectedSlot/selectedTimezone
      const payload: any = {
        calendarId,
        locationId: this.locationId,
        contactId: data.contactId,
        startTime: startDateTime,
        endTime: endDateTime,
        selectedTimezone: data.timezone || 'America/New_York',
        selectedSlot: startDateTime,
        title: data.title || 'Phone Consultation',
        appointmentStatus: 'confirmed',
        assignedUserId: this.connection.config?.assigned_user_id || undefined,
        notes: data.description || 'Booked via AI voice agent',
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      console.log('[GHL] Booking appointment via v2:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrlV2}/calendars/events/appointments`, {
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
        throw new Error(`GHL API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log('[GHL] Appointment booked successfully:', result.id || result.event?.id);

      return {
        success: true,
        data: { appointmentId: result.id || result.event?.id || 'booked' }
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

      const response = await fetch(`${this.baseUrlV2}/workflows/${workflowId}/subscribe`, {
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
        `${this.baseUrlV2}/calendars/?locationId=${this.locationId}`,
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
        `${this.baseUrlV2}/opportunities/pipelines?locationId=${this.locationId}`,
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
        `${this.baseUrlV2}/opportunities/pipelines/${pipelineId}`,
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
        `${this.baseUrlV2}/workflows/?locationId=${this.locationId}`,
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

      const response = await fetch(`${this.baseUrlV2}/opportunities/`, {
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
