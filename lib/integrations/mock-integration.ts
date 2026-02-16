/**
 * Mock Integration for Testing
 * Simulates integration behavior without real API calls
 */

import { BaseIntegration, IntegrationResponse, IntegrationCallData } from './base-integration';

export class MockIntegration extends BaseIntegration {
  async validateCredentials(): Promise<IntegrationResponse<boolean>> {
    console.log(`[MockIntegration] Validating credentials for ${this.connection.integration_type}`);

    // Always succeed after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: true
    };
  }

  async createContact(data: {
    name: string;
    email?: string;
    phone?: string;
    additionalFields?: Record<string, any>;
  }): Promise<IntegrationResponse<string>> {
    console.log(`[MockIntegration] Creating contact:`, data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate fake ID
    const mockId = `mock_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logOperation('create_contact', 'success', { contactId: mockId });

    return {
      success: true,
      data: mockId
    };
  }

  async addNote(contactId: string, note: string): Promise<IntegrationResponse<void>> {
    console.log(`[MockIntegration] Adding note to contact ${contactId}:`, note.substring(0, 50) + '...');

    await new Promise(resolve => setTimeout(resolve, 200));

    this.logOperation('add_note', 'success', { contactId, noteLength: note.length });

    return {
      success: true,
      data: undefined
    };
  }

  async processCallData(callData: IntegrationCallData): Promise<IntegrationResponse<void>> {
    console.log(`[MockIntegration] Processing call data for ${this.connection.integration_type}`);

    // Simulate creating contact
    const contactResult = await this.createContact({
      name: callData.customerName || 'Unknown Caller',
      phone: callData.customerPhone,
      email: callData.customerEmail,
      additionalFields: {
        source: 'voice_call',
        call_id: callData.callId,
        call_outcome: callData.callOutcome
      }
    });

    if (!contactResult.success) {
      return contactResult;
    }

    // Simulate adding note
    const note = `
Call Summary:
- Duration: ${callData.durationSeconds}s
- Outcome: ${callData.callOutcome || 'unknown'}
- Sentiment: ${callData.callSentiment || 'neutral'}

${callData.callSummary || 'No summary available'}

${callData.recordingUrl ? `Recording: ${callData.recordingUrl}` : ''}
    `.trim();

    await this.addNote(contactResult.data, note);

    return {
      success: true,
      data: undefined
    };
  }
}

/**
 * Create mock integration for any type
 */
export function createMockIntegration(integrationType: string): MockIntegration {
  return new MockIntegration({
    id: `mock_${integrationType}_${Date.now()}`,
    agent_id: 'test_agent',
    integration_type: integrationType as any,
    api_key: 'mock_api_key',
    is_active: true,
    config: {
      mock_mode: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}
