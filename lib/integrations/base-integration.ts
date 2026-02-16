/**
 * Base Integration Abstract Class
 * All CRM integrations extend this to ensure consistent interface
 */

export interface IntegrationConnection {
  id: string;
  agent_id: string;
  organization_id: string;
  integration_type: IntegrationType;
  is_active: boolean;
  connection_status: 'connected' | 'disconnected' | 'error' | 'expired';
  auth_type: 'oauth' | 'api_key' | 'webhook';
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  api_key?: string;
  api_secret?: string;
  instance_url?: string;
  webhook_url?: string;
  webhook_secret?: string;
  config: Record<string, any>;
  sync_enabled: boolean;
  last_sync_at?: Date;
  last_error?: string;
}

export type IntegrationType =
  | 'google_calendar'
  | 'calendly'
  | 'cal_com'
  | 'gohighlevel'
  | 'zapier'
  | 'housecall_pro'
  | 'hubspot'
  | 'salesforce'
  | 'stripe';

export interface ContactData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  customFields?: Record<string, any>;
}

export interface AppointmentData {
  contactId?: string;
  title: string;
  description?: string;
  date: string; // ISO format
  time: string; // HH:MM format
  timezone: string;
  durationMinutes: number;
  location?: string;
  serviceType?: string;
}

export interface NoteData {
  contactId: string;
  subject?: string;
  content: string;
  timestamp: Date;
  attachments?: {
    url: string;
    filename: string;
    type: string;
  }[];
}

export interface CallData {
  callId: string;
  agentId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  callOutcome: string;
  callSummary?: string;
  callSentiment?: string;
  transcript?: string;
  recordingUrl?: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  appointmentBooked?: AppointmentData;
}

export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export abstract class BaseIntegration {
  protected connection: IntegrationConnection;

  constructor(connection: IntegrationConnection) {
    this.connection = connection;
  }

  /**
   * Get integration type identifier
   */
  abstract getType(): IntegrationType;

  /**
   * Get human-readable name
   */
  abstract getName(): string;

  /**
   * Validate connection credentials
   */
  abstract validateConnection(): Promise<IntegrationResponse<boolean>>;

  /**
   * Refresh OAuth tokens if needed
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.connection.auth_type !== 'oauth') {
      return true;
    }

    if (!this.connection.token_expires_at) {
      return true;
    }

    const expiresAt = new Date(this.connection.token_expires_at);
    const now = new Date();
    const bufferMinutes = 5; // Refresh 5 minutes before expiry

    if (expiresAt.getTime() - now.getTime() > bufferMinutes * 60 * 1000) {
      return true; // Token still valid
    }

    return await this.refreshOAuthToken();
  }

  /**
   * Refresh OAuth token (override in OAuth integrations)
   */
  protected async refreshOAuthToken(): Promise<boolean> {
    throw new Error('refreshOAuthToken not implemented for this integration');
  }

  // ==================== Contact Management ====================

  /**
   * Create a new contact in the CRM
   */
  abstract createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>>;

  /**
   * Update existing contact
   */
  abstract updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>>;

  /**
   * Find contact by phone or email
   */
  abstract findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>>;

  /**
   * Get or create contact (idempotent)
   */
  async getOrCreateContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    // Try to find existing contact
    const existing = await this.findContact(data.phone, data.email);

    if (existing.success && existing.data) {
      return {
        success: true,
        data: existing.data
      };
    }

    // Create new contact
    return await this.createContact(data);
  }

  // ==================== Notes & Activities ====================

  /**
   * Add a note to a contact
   */
  abstract addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>>;

  /**
   * Add call recording as attachment (optional — override in integrations that support it)
   */
  async addAttachment(contactId: string, fileUrl: string, filename: string): Promise<IntegrationResponse<void>> {
    return { success: false, error: 'addAttachment not supported by this integration' };
  }

  // ==================== Calendar & Appointments ====================

  /**
   * Check calendar availability (optional — override in integrations that support it)
   */
  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>> {
    return { success: false, error: 'checkAvailability not supported by this integration' };
  }

  /**
   * Book an appointment (optional — override in integrations that support it)
   */
  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    return { success: false, error: 'bookAppointment not supported by this integration' };
  }

  // ==================== Workflows & Triggers ====================

  /**
   * Trigger a workflow/automation in the CRM (optional — override in integrations that support it)
   */
  async triggerWorkflow(workflowId: string, contactId: string, data?: Record<string, any>): Promise<IntegrationResponse<void>> {
    return { success: false, error: 'triggerWorkflow not supported by this integration' };
  }

  // ==================== Post-Call Integration ====================

  /**
   * Main entry point: Process call data and sync to CRM
   * This is called after every call ends
   */
  async processCallData(callData: CallData): Promise<IntegrationResponse<void>> {
    try {
      await this.refreshTokenIfNeeded();

      // 1. Find or create contact
      const contactResult = await this.getOrCreateContact({
        name: callData.customerName,
        phone: callData.customerPhone,
        email: callData.customerEmail,
      });

      if (!contactResult.success || !contactResult.data) {
        return {
          success: false,
          error: 'Failed to create/find contact',
          errorCode: 'CONTACT_ERROR'
        };
      }

      const { contactId } = contactResult.data;

      // 2. Add call note with summary
      const noteContent = this.buildCallNote(callData);
      await this.addNote({
        contactId,
        subject: `Call: ${callData.callOutcome}`,
        content: noteContent,
        timestamp: callData.endedAt,
        attachments: callData.recordingUrl ? [{
          url: callData.recordingUrl,
          filename: `call_${callData.callId}.mp3`,
          type: 'audio/mpeg'
        }] : undefined
      });

      // 3. If appointment was booked, create calendar event
      if (callData.appointmentBooked && this.bookAppointment) {
        await this.bookAppointment({
          ...callData.appointmentBooked,
          contactId
        });
      }

      return { success: true };

    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errorCode: 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Build formatted call note
   */
  protected buildCallNote(callData: CallData): string {
    const lines = [
      `📞 Call Summary`,
      ``,
      `Outcome: ${callData.callOutcome}`,
      `Duration: ${Math.floor(callData.durationSeconds / 60)}m ${callData.durationSeconds % 60}s`,
      `Time: ${callData.startedAt.toLocaleString()}`,
    ];

    if (callData.callSentiment) {
      lines.push(`Sentiment: ${callData.callSentiment}`);
    }

    if (callData.callSummary) {
      lines.push(``, `Summary:`, callData.callSummary);
    }

    if (callData.appointmentBooked) {
      const apt = callData.appointmentBooked;
      lines.push(
        ``,
        `✅ Appointment Booked:`,
        `Date: ${apt.date}`,
        `Time: ${apt.time}`,
        `Service: ${apt.serviceType || 'N/A'}`
      );
    }

    if (callData.transcript) {
      lines.push(``, `Transcript:`, callData.transcript);
    }

    return lines.join('\n');
  }

  // ==================== Field Mapping ====================

  /**
   * Apply custom field mappings from database
   */
  protected applyFieldMappings(data: Record<string, any>, mappings: Record<string, string>): Record<string, any> {
    const mapped: Record<string, any> = {};

    for (const [sourceField, targetField] of Object.entries(mappings)) {
      if (data[sourceField] !== undefined) {
        mapped[targetField] = data[sourceField];
      }
    }

    return mapped;
  }

  // ==================== Error Handling ====================

  /**
   * Handle API errors consistently
   */
  protected handleError(error: any, context: string): IntegrationResponse<never> {
    console.error(`[${this.getType()}] ${context}:`, error);

    return {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN_ERROR'
    };
  }

  // ==================== Rate Limiting ====================

  /**
   * Implement rate limiting (override per integration)
   */
  protected async rateLimit(): Promise<void> {
    // Default: no rate limiting
    // Override in specific integrations if needed
  }
}
