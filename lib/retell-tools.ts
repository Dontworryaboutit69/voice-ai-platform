/**
 * Retell AI Custom Tools Configuration
 *
 * These tools are registered with Retell AI agents so they can call
 * our API during conversations to check calendar availability, etc.
 */

export interface RetellCustomTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
    async?: boolean;
    speak_on_send?: boolean;
    speak_during_execution?: boolean;
    url?: string;
    execution_message_description?: string;
  };
}

/**
 * Get the app URL for Retell-facing webhook/tool endpoints.
 * Retell servers must be able to reach these URLs from the internet,
 * so localhost is never valid here — we fall back to production.
 */
const PRODUCTION_URL = 'https://voice-ai-platform-phi.vercel.app';

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  // Retell can't reach localhost — always use production URL in that case
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    return PRODUCTION_URL;
  }
  return url;
}

/**
 * Generate check availability tool for an agent
 */
export function getCheckAvailabilityTool(agentId: string): RetellCustomTool {
  return {
    type: 'function',
    function: {
      name: 'check_calendar_availability',
      description: 'Check available appointment time slots for a specific date. Use this BEFORE booking any appointments to avoid double-booking. Returns a list of available time slots.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'The date to check availability for, in YYYY-MM-DD format (e.g., 2024-03-20)'
          },
          timezone: {
            type: 'string',
            description: 'The timezone for the appointment (e.g., America/New_York, America/Los_Angeles). Optional, defaults to America/New_York.'
          }
        },
        required: ['date']
      },
      async: true,
      speak_on_send: false,
      speak_during_execution: true,
      execution_message_description: 'Checking available time slots',
      url: `${getAppUrl()}/api/agents/${agentId}/calendar-check`
    }
  };
}

/**
 * Generate book appointment tool for an agent
 */
export function getBookAppointmentTool(agentId: string): RetellCustomTool {
  return {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book an appointment for the caller. You MUST first check availability using check_calendar_availability before booking. Collects the caller\'s name and phone number, then books the selected time slot.',
      parameters: {
        type: 'object',
        properties: {
          caller_name: {
            type: 'string',
            description: 'The full name of the caller (e.g., "John Smith")'
          },
          caller_phone: {
            type: 'string',
            description: 'The caller\'s phone number (e.g., "+15551234567" or "555-123-4567")'
          },
          caller_email: {
            type: 'string',
            description: 'The caller\'s email address (optional)'
          },
          date: {
            type: 'string',
            description: 'The appointment date in YYYY-MM-DD format (e.g., 2026-02-20)'
          },
          time: {
            type: 'string',
            description: 'The appointment time in HH:MM 24-hour format (e.g., 14:00 for 2:00 PM)'
          },
          timezone: {
            type: 'string',
            description: 'Timezone (e.g., America/New_York). Defaults to America/New_York if not specified.'
          }
        },
        required: ['caller_name', 'caller_phone', 'date', 'time']
      },
      async: true,
      speak_on_send: false,
      speak_during_execution: true,
      execution_message_description: 'Booking your appointment now',
      url: `${getAppUrl()}/api/agents/${agentId}/book-appointment`
    }
  };
}

/**
 * Generate transfer call tool config for Retell LLM general_tools.
 * Uses the Retell v2 format: transfer_destination + transfer_option (required).
 * Defaults to warm_transfer so the AI can announce the transfer to the caller.
 */
export function getTransferCallToolConfig(
  transferNumber: string,
  transferPersonName?: string
): {
  type: 'transfer_call';
  name: string;
  description?: string;
  transfer_destination: { type: 'predefined'; number: string };
  transfer_option: { type: 'warm_transfer' };
} {
  return {
    type: 'transfer_call',
    name: 'transfer_call',
    description: `Transfer the call to ${transferPersonName || 'a team member'} when the caller requests a live person or meets transfer criteria.`,
    transfer_destination: {
      type: 'predefined',
      number: transferNumber,
    },
    transfer_option: {
      type: 'warm_transfer',
    },
  };
}

/**
 * Get all custom tools for an agent based on their active integrations
 */
export async function getAgentCustomTools(agentId: string, integrations: string[]): Promise<RetellCustomTool[]> {
  const tools: RetellCustomTool[] = [];

  // Add calendar tools if agent has any calendar integration
  const hasCalendarIntegration = integrations.some(type =>
    ['gohighlevel', 'google_calendar', 'calendly', 'cal_com'].includes(type)
  );

  if (hasCalendarIntegration) {
    tools.push(getCheckAvailabilityTool(agentId));
    tools.push(getBookAppointmentTool(agentId));
  }

  return tools;
}

/**
 * Update Retell agent with custom tools
 */
export async function updateRetellAgentTools(
  retellAgentId: string,
  agentId: string,
  integrations: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Retell Tools] Updating tools for agent ${agentId} (Retell: ${retellAgentId})`);
    console.log(`[Retell Tools] Active integrations:`, integrations);

    const customTools = await getAgentCustomTools(agentId, integrations);
    console.log(`[Retell Tools] Generated ${customTools.length} custom tools`);

    if (customTools.length === 0) {
      console.log(`[Retell Tools] No tools to register`);
      return { success: true };
    }

    // Log the tools being registered
    customTools.forEach((tool, index) => {
      console.log(`[Retell Tools] Tool ${index + 1}: ${tool.function.name}`);
      console.log(`[Retell Tools]   URL: ${tool.function.url}`);
    });

    const payload = {
      agent_id: retellAgentId,
      custom_tools: customTools
    };

    console.log(`[Retell Tools] Sending to Retell API...`);
    const response = await fetch(`https://api.retellai.com/update-agent`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Retell Tools] API Error:', error);
      return { success: false, error: `Retell API error: ${response.statusText}` };
    }

    const result = await response.json();
    console.log(`[Retell Tools] ✅ Successfully registered ${customTools.length} tool(s)`);
    console.log(`[Retell Tools] Response:`, result);

    return { success: true };

  } catch (error: any) {
    console.error('[Retell Tools] Exception:', error);
    return { success: false, error: error.message };
  }
}
