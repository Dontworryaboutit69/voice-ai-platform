/**
 * Housecall Pro Integration
 * API Key authentication
 * Home services CRM: customers, jobs, scheduling
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class HousecallProIntegration extends BaseIntegration {
  private baseUrl = 'https://api.housecallpro.com/v1';
  private apiKey: string;
  private companyId: string;

  constructor(connection: any) {
    super(connection);
    this.apiKey = connection.api_key || '';
    this.companyId = connection.config?.company_id || '';
  }

  getType(): IntegrationType {
    return 'housecall_pro';
  }

  getName(): string {
    return 'Housecall Pro';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/company`, {
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

  // ==================== Contact Management (Customers) ====================

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      await this.rateLimit();

      const nameParts = (data.name || '').split(' ');
      const firstName = data.firstName || nameParts[0] || '';
      const lastName = data.lastName || nameParts.slice(1).join(' ') || '';

      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email: data.email || undefined,
        mobile_number: data.phone || undefined,
        company: data.company || undefined,
      };

      // Add address if provided
      if (data.address) {
        payload.addresses = [{
          street: data.address,
          type: 'service',
        }];
      }

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Housecall Pro API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { contactId: result.customer.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createContact');
    }
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    try {
      await this.rateLimit();

      const payload: any = {};

      if (data.firstName) payload.first_name = data.firstName;
      if (data.lastName) payload.last_name = data.lastName;
      if (data.email) payload.email = data.email;
      if (data.phone) payload.mobile_number = data.phone;
      if (data.company) payload.company = data.company;

      const response = await fetch(`${this.baseUrl}/customers/${contactId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Housecall Pro API error: ${errorData.message || response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'updateContact');
    }
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    try {
      await this.rateLimit();

      let query = '';

      if (email) {
        query = `email=${encodeURIComponent(email)}`;
      } else if (phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        query = `phone=${encodeURIComponent(normalizedPhone)}`;
      } else {
        return { success: true, data: null };
      }

      const response = await fetch(`${this.baseUrl}/customers?${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Housecall Pro API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.customers && result.customers.length > 0) {
        return {
          success: true,
          data: { contactId: result.customers[0].id }
        };
      }

      return { success: true, data: null };
    } catch (error: any) {
      return this.handleError(error, 'findContact');
    }
  }

  // ==================== Notes ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    try {
      await this.rateLimit();

      // Housecall Pro adds notes to jobs, not directly to customers
      // We'll create a note as a customer "comment"
      const payload = {
        customer_id: data.contactId,
        note: data.content,
        created_at: data.timestamp.toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/customers/${data.contactId}/notes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Housecall Pro API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { noteId: result.note?.id || `note_${Date.now()}` }
      };
    } catch (error: any) {
      return this.handleError(error, 'addNote');
    }
  }

  // ==================== Jobs (Appointments) ====================

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    try {
      await this.rateLimit();

      // Parse date and time
      const [year, month, day] = data.date.split('-').map(Number);
      const [hour, minute] = data.time.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, hour, minute);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + data.durationMinutes);

      // Create job in Housecall Pro
      const payload = {
        customer_id: data.contactId,
        description: data.title,
        notes: data.description || '',
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        // Optional: assign to pro/employee
        employee_id: this.connection.config?.default_employee_id || undefined,
        // Optional: add line items for services
        line_items: data.serviceType ? [{
          name: data.serviceType,
          description: data.description || '',
        }] : [],
      };

      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Housecall Pro API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { appointmentId: result.job.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    try {
      await this.rateLimit();

      // Get jobs for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const employeeId = this.connection.config?.default_employee_id;

      let query = `start_time=${startOfDay.toISOString()}&end_time=${endOfDay.toISOString()}`;
      if (employeeId) {
        query += `&employee_id=${employeeId}`;
      }

      const response = await fetch(`${this.baseUrl}/jobs?${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Housecall Pro API error: ${response.statusText}`);
      }

      const result = await response.json();
      const bookedJobs = result.jobs || [];

      // Define business hours
      const businessStart = this.connection.config?.business_hours_start || 8;
      const businessEnd = this.connection.config?.business_hours_end || 18;
      const slotDuration = this.connection.config?.slot_duration_minutes || 120; // 2 hours default for home services

      // Generate all slots
      const allSlots: string[] = [];
      for (let hour = businessStart; hour < businessEnd; hour += Math.floor(slotDuration / 60)) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }

      // Filter booked slots
      const availableSlots = allSlots.filter(slot => {
        const [hour] = slot.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        return !bookedJobs.some((job: any) => {
          const jobStart = new Date(job.start_time);
          const jobEnd = new Date(job.end_time);

          return (
            (slotStart >= jobStart && slotStart < jobEnd) ||
            (slotEnd > jobStart && slotEnd <= jobEnd) ||
            (slotStart <= jobStart && slotEnd >= jobEnd)
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

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // Housecall Pro rate limits: 120 requests per minute
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
