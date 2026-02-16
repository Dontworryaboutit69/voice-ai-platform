/**
 * Zapier Webhook Integration
 * Send call data to Zapier webhooks
 * User can then connect to 5,000+ apps via Zapier
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType, CallData } from './base-integration';

export class ZapierIntegration extends BaseIntegration {
  private webhookUrl: string;

  constructor(connection: any) {
    super(connection);
    this.webhookUrl = connection.webhook_url || '';
  }

  getType(): IntegrationType {
    return 'zapier';
  }

  getName(): string {
    return 'Zapier';
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      // Send test payload to webhook
      const testPayload = {
        test: true,
        message: 'Connection test from Voice AI Platform',
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        return { success: true, data: true };
      }

      return {
        success: false,
        error: 'Webhook returned non-200 status',
        errorCode: 'WEBHOOK_ERROR'
      };
    } catch (error: any) {
      return this.handleError(error, 'validateConnection');
    }
  }

  // ==================== Contact Management ====================
  // Zapier doesn't manage contacts directly
  // Instead, we send data to webhook and let Zapier handle it

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      const payload = {
        action: 'create_contact',
        contact: {
          name: data.name,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          company: data.company,
          custom_fields: data.customFields,
        },
        timestamp: new Date().toISOString(),
      };

      await this.sendWebhook(payload);

      return {
        success: true,
        data: { contactId: `zapier_${data.email || data.phone}` }
      };
    } catch (error: any) {
      return this.handleError(error, 'createContact');
    }
  }

  async updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>> {
    try {
      const payload = {
        action: 'update_contact',
        contact_id: contactId,
        updates: data,
        timestamp: new Date().toISOString(),
      };

      await this.sendWebhook(payload);

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'updateContact');
    }
  }

  async findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>> {
    // Zapier webhooks are one-way (outbound only)
    // Can't query for existing contacts
    return {
      success: true,
      data: null
    };
  }

  // ==================== Notes ====================

  async addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>> {
    try {
      const payload = {
        action: 'add_note',
        contact_id: data.contactId,
        note: {
          subject: data.subject,
          content: data.content,
          timestamp: data.timestamp.toISOString(),
          attachments: data.attachments,
        },
      };

      await this.sendWebhook(payload);

      return {
        success: true,
        data: { noteId: `zapier_note_${Date.now()}` }
      };
    } catch (error: any) {
      return this.handleError(error, 'addNote');
    }
  }

  // ==================== Appointments ====================

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    try {
      const payload = {
        action: 'book_appointment',
        appointment: {
          contact_id: data.contactId,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          timezone: data.timezone,
          duration_minutes: data.durationMinutes,
          location: data.location,
          service_type: data.serviceType,
        },
        timestamp: new Date().toISOString(),
      };

      await this.sendWebhook(payload);

      return {
        success: true,
        data: { appointmentId: `zapier_apt_${Date.now()}` }
      };
    } catch (error: any) {
      return this.handleError(error, 'bookAppointment');
    }
  }

  // ==================== Call Data Processing ====================

  /**
   * Override processCallData to send complete call payload
   * This is the main entry point for Zapier integration
   */
  async processCallData(callData: CallData): Promise<IntegrationResponse<void>> {
    try {
      const payload = {
        action: 'call_completed',
        call: {
          call_id: callData.callId,
          agent_id: callData.agentId,
          customer_name: callData.customerName,
          customer_phone: callData.customerPhone,
          customer_email: callData.customerEmail,
          call_outcome: callData.callOutcome,
          call_summary: callData.callSummary,
          call_sentiment: callData.callSentiment,
          transcript: callData.transcript,
          recording_url: callData.recordingUrl,
          started_at: callData.startedAt.toISOString(),
          ended_at: callData.endedAt.toISOString(),
          duration_seconds: callData.durationSeconds,
          appointment_booked: callData.appointmentBooked,
        },
        timestamp: new Date().toISOString(),
      };

      await this.sendWebhook(payload);

      return { success: true };
    } catch (error: any) {
      return this.handleError(error, 'processCallData');
    }
  }

  // ==================== Webhook Sending ====================

  private async sendWebhook(payload: any): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VoiceAI-Platform/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }
  }

  // ==================== Zapier-Specific Helpers ====================

  /**
   * Send test data to Zapier for trigger setup
   */
  static async sendTestData(webhookUrl: string): Promise<boolean> {
    try {
      const testPayload = {
        action: 'call_completed',
        call: {
          call_id: 'test_call_123',
          agent_id: 'test_agent_456',
          customer_name: 'John Doe',
          customer_phone: '+1234567890',
          customer_email: 'john@example.com',
          call_outcome: 'appointment_booked',
          call_summary: 'Customer scheduled roof inspection for next Tuesday',
          call_sentiment: 'positive',
          transcript: 'Sample transcript content...',
          recording_url: 'https://example.com/recording.mp3',
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: 180,
          appointment_booked: {
            title: 'Roof Inspection',
            date: '2026-02-20',
            time: '14:00',
            timezone: 'America/New_York',
            durationMinutes: 60,
            serviceType: 'Inspection',
          },
        },
        test: true,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      return response.ok;
    } catch (error) {
      console.error('[Zapier] Test data send failed:', error);
      return false;
    }
  }

  /**
   * Generate sample webhook payload for documentation
   */
  static getSamplePayload(): any {
    return {
      action: 'call_completed',
      call: {
        call_id: 'call_abc123',
        agent_id: 'agent_xyz789',
        customer_name: 'Jane Smith',
        customer_phone: '+14079780655',
        customer_email: 'jane@example.com',
        call_outcome: 'message_taken',
        call_summary: 'Customer inquiring about roof repair services',
        call_sentiment: 'neutral',
        transcript: 'Full call transcript...',
        recording_url: 'https://platform.com/recordings/call_abc123.mp3',
        started_at: '2026-02-15T14:30:00Z',
        ended_at: '2026-02-15T14:35:00Z',
        duration_seconds: 300,
        appointment_booked: null,
      },
      timestamp: '2026-02-15T14:35:01Z',
    };
  }
}
