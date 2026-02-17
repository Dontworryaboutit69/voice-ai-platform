import Retell from 'retell-sdk';
import { createServiceClient } from '../lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';
const APP_URL = 'https://voice-ai-platform-orcin.vercel.app';

async function fixRetellURLs() {
  console.log('Starting Retell URL fix...');
  console.log(`Using APP_URL: ${APP_URL}`);

  const supabase = createServiceClient();

  // Get Elite Dental agent
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .ilike('business_name', '%Elite%')
    .single();

  if (error || !agent) {
    console.error('Agent not found:', error);
    return;
  }

  console.log(`Found agent: ${agent.business_name} (${agent.id})`);
  console.log(`Retell Agent ID: ${agent.retell_agent_id}`);
  console.log(`Retell LLM ID: ${agent.retell_llm_id}`);

  const retell = new Retell({ apiKey: RETELL_API_KEY });

  // Update LLM with correct URLs
  if (agent.retell_llm_id) {
    console.log('\n🔄 Updating LLM configuration...');

    const { data: ghlIntegration } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agent.id)
      .eq('integration_type', 'gohighlevel')
      .eq('is_active', true)
      .single();

    const tools: any[] = [];

    if (ghlIntegration && ghlIntegration.config?.calendar_id) {
      console.log('✅ GHL integration found, adding calendar tools');

      // Calendar availability tool
      tools.push({
        type: 'custom',
        name: 'check_calendar_availability',
        description: 'Check available appointment time slots for a specific date. Use this BEFORE booking an appointment to see what times are available.',
        url: `${APP_URL}/api/agents/${agent.id}/check-availability`,
        speak_on_send: false,
        speak_during_execution: true,
        execution_message_description: 'Checking available times',
        parameters: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date to check availability for in YYYY-MM-DD format (e.g., 2026-02-20)'
            },
            timezone: {
              type: 'string',
              description: 'Timezone (default: America/New_York)',
              default: 'America/New_York'
            }
          },
          required: ['date']
        }
      });

      // Appointment booking tool
      tools.push({
        type: 'custom',
        name: 'book_appointment',
        description: 'Book an appointment in the calendar. Use this when the customer wants to schedule an appointment and you have collected their name, phone number, preferred date, and time.',
        url: `${APP_URL}/api/tools/book-appointment`,
        speak_on_send: false,
        speak_during_execution: true,
        execution_message_description: 'Booking your appointment',
        parameters: {
          type: 'object',
          properties: {
            agent_id: {
              type: 'string',
              description: 'The agent ID (automatically provided)',
              default: agent.id
            },
            customer_name: {
              type: 'string',
              description: 'Full name of the customer'
            },
            customer_phone: {
              type: 'string',
              description: 'Phone number of the customer'
            },
            customer_email: {
              type: 'string',
              description: 'Email address of the customer (optional)'
            },
            appointment_date: {
              type: 'string',
              description: 'Date of appointment in YYYY-MM-DD format (e.g., 2026-02-20)'
            },
            appointment_time: {
              type: 'string',
              description: 'Time of appointment in HH:MM format using 24-hour time (e.g., 14:30 for 2:30 PM)'
            },
            duration_minutes: {
              type: 'number',
              description: 'Duration of appointment in minutes (default: 60)',
              default: 60
            },
            notes: {
              type: 'string',
              description: 'Any additional notes or details about the appointment'
            }
          },
          required: ['agent_id', 'customer_name', 'customer_phone', 'appointment_date', 'appointment_time']
        }
      });
    }

    try {
      await retell.llm.update(agent.retell_llm_id, {
        general_tools: tools
      });
      console.log(`✅ Updated LLM ${agent.retell_llm_id} with ${tools.length} tools`);
      console.log(`   Calendar availability URL: ${APP_URL}/api/agents/${agent.id}/check-availability`);
      console.log(`   Booking URL: ${APP_URL}/api/tools/book-appointment`);
    } catch (error: any) {
      console.error('❌ Failed to update LLM:', error.message);
    }
  }

  // Update Agent with correct webhook URL
  if (agent.retell_agent_id) {
    console.log('\n🔄 Updating Retell Agent webhook...');

    try {
      await retell.agent.update(agent.retell_agent_id, {
        webhook_url: `${APP_URL}/api/webhooks/retell/call-events`
      });
      console.log(`✅ Updated agent webhook to: ${APP_URL}/api/webhooks/retell/call-events`);
    } catch (error: any) {
      console.error('❌ Failed to update agent:', error.message);
    }
  }

  console.log('\n✅ Retell URL fix complete!');
  console.log('\nNext steps:');
  console.log('1. Make a new test call');
  console.log('2. Try checking calendar availability');
  console.log('3. Verify contact is created in GHL');
}

fixRetellURLs().catch(console.error);
