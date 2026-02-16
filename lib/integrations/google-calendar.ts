/**
 * Google Calendar Integration
 * OAuth 2.0 authentication
 * Read availability, book appointments
 */

import { google } from 'googleapis';
import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class GoogleCalendarIntegration extends BaseIntegration {
  private calendar: any;
  private oauth2Client: any;

  constructor(connection: any) {
    super(connection);
    this.initializeClient();
  }

  private initializeClient() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    if (this.connection.access_token) {
      this.oauth2Client.setCredentials({
        access_token: this.connection.access_token,
        refresh_token: this.connection.refresh_token,
        expiry_date: this.connection.token_expires_at ? new Date(this.connection.token_expires_at).getTime() : undefined
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  getType(): IntegrationType {
    return 'google_calendar';
  }

  getName(): string {
    return 'Google Calendar';
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      await this.calendar.calendarList.list();
      return { success: true, data: true };
    } catch (error: any) {
      return this.handleError(error, 'validateConnection');
    }
  }

  protected async refreshOAuthToken(): Promise<boolean> {
    try {
      if (!this.connection.refresh_token) {
        throw new Error('No refresh token available');
      }

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      // Update connection in database
      const { createServiceClient } = await import('@/lib/supabase/client');
      const supabase = createServiceClient();

      await supabase
        .from('integration_connections')
        .update({
          access_token: credentials.access_token,
          token_expires_at: new Date(credentials.expiry_date).toISOString(),
        })
        .eq('id', this.connection.id);

      // Update local connection object
      this.connection.access_token = credentials.access_token;
      this.connection.token_expires_at = new Date(credentials.expiry_date);

      this.oauth2Client.setCredentials(credentials);

      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Token refresh failed:', error);
      return false;
    }
  }

  // ==================== Contact Management ====================
  // Google Calendar doesn't have contacts, so these are no-ops

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    // Google Calendar doesn't manage contacts
    // Return synthetic ID for compatibility
    return {
      success: true,
      data: { contactId: `gcal_${data.email || data.phone}` }
    };
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    return { success: true };
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    return {
      success: true,
      data: email ? { contactId: `gcal_${email}` } : null
    };
  }

  // ==================== Notes ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    // Google Calendar doesn't have notes separate from events
    // This is a no-op for calendar-only integration
    return {
      success: true,
      data: { noteId: `note_${Date.now()}` }
    };
  }

  // ==================== Calendar & Appointments ====================

  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    try {
      const calendarId = this.connection.config?.calendar_id || 'primary';

      // Get events for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        timeZone: timezone,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      // Define business hours (configurable via config)
      const businessStart = this.connection.config?.business_hours_start || 9; // 9 AM
      const businessEnd = this.connection.config?.business_hours_end || 17; // 5 PM
      const slotDuration = this.connection.config?.slot_duration_minutes || 60;

      // Generate all possible slots
      const allSlots: string[] = [];
      for (let hour = businessStart; hour < businessEnd; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          allSlots.push(time);
        }
      }

      // Filter out booked slots
      const availableSlots = allSlots.filter(slot => {
        const [hour, minute] = slot.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Check if slot overlaps with any event
        return !events.some((event: any) => {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);

          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (slotStart <= eventStart && slotEnd >= eventEnd)
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
      const calendarId = this.connection.config?.calendar_id || 'primary';

      // Parse date and time
      const [year, month, day] = data.date.split('-').map(Number);
      const [hour, minute] = data.time.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, hour, minute);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + data.durationMinutes);

      // Create event
      const event = {
        summary: data.title,
        description: data.description || '',
        location: data.location || '',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: data.timezone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: data.timezone,
        },
        attendees: data.contactId && data.contactId.includes('@') ? [
          { email: data.contactId.replace('gcal_', '') }
        ] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: 'all', // Send email to attendees
      });

      return {
        success: true,
        data: { appointmentId: response.data.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  // ==================== OAuth Helpers ====================

  /**
   * Generate OAuth URL for user authorization
   */
  static generateAuthUrl(state: string): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state, // Pass agentId + organizationId
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange auth code for tokens
   */
  static async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  }> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date!,
    };
  }
}
