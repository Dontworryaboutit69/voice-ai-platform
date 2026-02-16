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
 * Get the app URL for webhook/tool endpoints
 */
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
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
      url: `${getAppUrl()}/api/agents/${agentId}/check-availability`
    }
  };
}

/**
 * Get all custom tools for an agent based on their active integrations
 */
export async function getAgentCustomTools(agentId: string, integrations: string[]): Promise<RetellCustomTool[]> {
  const tools: RetellCustomTool[] = [];

  // Add calendar availability check if agent has any calendar integration
  const hasCalendarIntegration = integrations.some(type =>
    ['gohighlevel', 'google-calendar', 'calendly'].includes(type)
  );

  if (hasCalendarIntegration) {
    tools.push(getCheckAvailabilityTool(agentId));
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
