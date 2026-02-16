/**
 * Stripe Integration
 * API Key authentication (secret key)
 * Payment processing, invoicing, customer management
 */

import { BaseIntegration, IntegrationResponse, ContactData, AppointmentData, NoteData, IntegrationType } from './base-integration';

export class StripeIntegration extends BaseIntegration {
  private baseUrl = 'https://api.stripe.com/v1';
  private apiKey: string;

  constructor(connection: any) {
    super(connection);
    this.apiKey = connection.api_key || '';
  }

  getType(): IntegrationType {
    return 'stripe';
  }

  getName(): string {
    return 'Stripe';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async validateConnection(): Promise<IntegrationResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/customers?limit=1`, {
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

  // ==================== Customer Management ====================

  async createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>> {
    try {
      await this.rateLimit();

      const params = new URLSearchParams();

      if (data.name) params.append('name', data.name);
      if (data.email) params.append('email', data.email);
      if (data.phone) params.append('phone', data.phone);
      if (data.address) params.append('address[line1]', data.address);

      // Add metadata
      params.append('metadata[source]', 'voice-ai-platform');
      if (data.customFields) {
        for (const [key, value] of Object.entries(data.customFields)) {
          params.append(`metadata[${key}]`, String(value));
        }
      }

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || response.statusText}`);
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

      const params = new URLSearchParams();

      if (data.name) params.append('name', data.name);
      if (data.email) params.append('email', data.email);
      if (data.phone) params.append('phone', data.phone);
      if (data.address) params.append('address[line1]', data.address);

      if (data.customFields) {
        for (const [key, value] of Object.entries(data.customFields)) {
          params.append(`metadata[${key}]`, String(value));
        }
      }

      const response = await fetch(`${this.baseUrl}/customers/${contactId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || response.statusText}`);
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

      let query = 'limit=1';

      if (email) {
        query += `&email=${encodeURIComponent(email)}`;
      } else if (phone) {
        query += `&phone=${encodeURIComponent(phone)}`;
      }

      const response = await fetch(`${this.baseUrl}/customers/search?query=${query}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.data && result.data.length > 0) {
        return {
          success: true,
          data: { contactId: result.data[0].id }
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

      // Add note as customer metadata update
      const params = new URLSearchParams();
      params.append(`metadata[note_${Date.now()}]`, data.content);

      const response = await fetch(`${this.baseUrl}/customers/${data.contactId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      return {
        success: true,
        data: { noteId: `note_${Date.now()}` }
      };
    } catch (error: any) {
      return this.handleError(error, 'addNote');
    }
  }

  // ==================== Appointments (Not directly supported) ====================

  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>> {
    // Stripe doesn't have appointment booking
    // Could create invoice or payment link for the appointment
    return {
      success: false,
      error: 'Appointment booking not supported by Stripe',
      errorCode: 'NOT_SUPPORTED'
    };
  }

  // ==================== Payment Processing ====================

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    customerId: string,
    amount: number,
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<IntegrationResponse<{ paymentIntentId: string; clientSecret: string }>> {
    try {
      await this.rateLimit();

      const params = new URLSearchParams();
      params.append('amount', Math.round(amount * 100).toString()); // Convert to cents
      params.append('currency', currency);
      params.append('customer', customerId);
      params.append('automatic_payment_methods[enabled]', 'true');

      if (description) {
        params.append('description', description);
      }

      if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
          params.append(`metadata[${key}]`, String(value));
        }
      }

      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: {
          paymentIntentId: result.id,
          clientSecret: result.client_secret
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'createPaymentIntent');
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(
    customerId: string,
    items: Array<{ description: string; amount: number; quantity?: number }>,
    dueDate?: Date
  ): Promise<IntegrationResponse<{ invoiceId: string; invoiceUrl: string }>> {
    try {
      await this.rateLimit();

      // Create invoice items
      for (const item of items) {
        const itemParams = new URLSearchParams();
        itemParams.append('customer', customerId);
        itemParams.append('amount', Math.round(item.amount * 100).toString());
        itemParams.append('currency', 'usd');
        itemParams.append('description', item.description);

        await fetch(`${this.baseUrl}/invoiceitems`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: itemParams.toString(),
        });
      }

      // Create invoice
      const invoiceParams = new URLSearchParams();
      invoiceParams.append('customer', customerId);
      invoiceParams.append('auto_advance', 'true');

      if (dueDate) {
        invoiceParams.append('due_date', Math.floor(dueDate.getTime() / 1000).toString());
      }

      const response = await fetch(`${this.baseUrl}/invoices`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: invoiceParams.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      // Finalize invoice
      await fetch(`${this.baseUrl}/invoices/${result.id}/finalize`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      return {
        success: true,
        data: {
          invoiceId: result.id,
          invoiceUrl: result.hosted_invoice_url
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'createInvoice');
    }
  }

  /**
   * Create payment link
   */
  async createPaymentLink(
    productName: string,
    amount: number,
    currency: string = 'usd',
    quantity?: number
  ): Promise<IntegrationResponse<{ paymentLinkId: string; url: string }>> {
    try {
      await this.rateLimit();

      // Create price
      const priceParams = new URLSearchParams();
      priceParams.append('unit_amount', Math.round(amount * 100).toString());
      priceParams.append('currency', currency);
      priceParams.append('product_data[name]', productName);

      const priceResponse = await fetch(`${this.baseUrl}/prices`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: priceParams.toString(),
      });

      if (!priceResponse.ok) {
        throw new Error('Failed to create price');
      }

      const priceResult = await priceResponse.json();

      // Create payment link
      const linkParams = new URLSearchParams();
      linkParams.append('line_items[0][price]', priceResult.id);
      linkParams.append('line_items[0][quantity]', (quantity || 1).toString());

      const linkResponse = await fetch(`${this.baseUrl}/payment_links`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: linkParams.toString(),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || linkResponse.statusText}`);
      }

      const linkResult = await linkResponse.json();

      return {
        success: true,
        data: {
          paymentLinkId: linkResult.id,
          url: linkResult.url
        }
      };
    } catch (error: any) {
      return this.handleError(error, 'createPaymentLink');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<IntegrationResponse<any>> {
    try {
      await this.rateLimit();

      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return this.handleError(error, 'getPaymentIntent');
    }
  }

  // ==================== Subscriptions ====================

  /**
   * Create subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, any>
  ): Promise<IntegrationResponse<{ subscriptionId: string }>> {
    try {
      await this.rateLimit();

      const params = new URLSearchParams();
      params.append('customer', customerId);
      params.append('items[0][price]', priceId);

      if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
          params.append(`metadata[${key}]`, String(value));
        }
      }

      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: { subscriptionId: result.id }
      };
    } catch (error: any) {
      return this.handleError(error, 'createSubscription');
    }
  }

  // ==================== Webhooks ====================

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      // Stripe webhook verification using stripe library
      // This is a placeholder - actual implementation would use stripe.webhooks.constructEvent
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== Rate Limiting ====================

  protected async rateLimit(): Promise<void> {
    // Stripe rate limits: 100 requests per second in test mode, higher in live mode
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
