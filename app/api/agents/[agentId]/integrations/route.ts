import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// GET - List all integrations for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    const { data: integrations, error } = await supabase
      .from('agent_integrations')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching integrations:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      integrations: integrations || []
    });

  } catch (error: any) {
    console.error('Error in GET /api/agents/[agentId]/integrations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST - Create new integration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { integrationType, credentials, settings } = await request.json();

    if (!integrationType || !credentials) {
      return NextResponse.json(
        { success: false, error: 'Integration type and credentials are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Insert or update integration
    const { data: integration, error } = await supabase
      .from('agent_integrations')
      .upsert({
        agent_id: agentId,
        integration_type: integrationType,
        credentials,
        settings: settings || {},
        is_active: true,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'agent_id,integration_type'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Update agent's prompt to include integration functions
    await updatePromptWithIntegration(agentId, integrationType, settings || {});

    return NextResponse.json({
      success: true,
      integration
    });

  } catch (error: any) {
    console.error('Error in POST /api/agents/[agentId]/integrations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create integration' },
      { status: 500 }
    );
  }
}

// Helper function to update prompt with integration instructions
async function updatePromptWithIntegration(
  agentId: string,
  integrationType: string,
  settings: any
) {
  const supabase = createServiceClient();

  // Get current prompt
  const { data: agent } = await supabase
    .from('agents')
    .select('current_prompt:prompt_versions!current_prompt_id(*)')
    .eq('id', agentId)
    .single();

  if (!agent || !agent.current_prompt) return;

  const currentPrompt = Array.isArray(agent.current_prompt) ? agent.current_prompt[0] : agent.current_prompt;
  let integrationInstructions = '';

  // Generate integration-specific instructions
  switch (integrationType) {
    case 'google-calendar':
      integrationInstructions = `

## GOOGLE CALENDAR INTEGRATION

You have access to the caller's Google Calendar. When scheduling appointments:

FUNCTION: check_calendar_availability
- Call this to check if a time slot is available
- Parameters: date (YYYY-MM-DD), time (HH:MM), duration (minutes)
- Returns: { available: boolean, conflicting_events: [] }

FUNCTION: book_appointment
- Call this to create a calendar event
- Parameters: date, time, duration, title, description, attendee_email
- Returns: { success: boolean, event_id: string }

${settings.autoBook ? '- Automatically book confirmed appointments' : '- Ask for confirmation before booking'}
${settings.sendConfirmation ? '- Send email confirmations for all bookings' : ''}
${settings.bufferTime ? `- Leave ${settings.bufferTime} minutes buffer between appointments` : ''}

Example:
Caller: "I'd like to schedule an appointment for tomorrow at 2pm"
You: "Let me check if that time is available..."
[Call check_calendar_availability]
You: "Great! 2pm tomorrow is available. I'll book that for you. May I have your email for the confirmation?"
[Collect email, then call book_appointment]
`;
      break;

    case 'calendly':
      integrationInstructions = `

## CALENDLY INTEGRATION

You can share the booking link with callers.

FUNCTION: get_calendly_link
- Returns the personalized Calendly booking URL
- No parameters needed

${settings.shareLink ? 'Share the Calendly link when appropriate during the call' : ''}

Example:
Caller: "How can I schedule an appointment?"
You: "I can send you our booking link. You'll be able to see all available times and choose what works best for you. What's your email address?"
[Collect email, call get_calendly_link, send link]
`;
      break;

    case 'gohighlevel':
      integrationInstructions = `

## GOHIGHLEVEL CRM INTEGRATION

${settings.createContacts ? `
FUNCTION: create_ghl_contact
- Call this when you collect contact information
- Parameters: name, email, phone, notes
- Automatically creates contact in GoHighLevel
- Returns: { success: boolean, contact_id: string }
` : ''}

${settings.createOpportunities ? `
FUNCTION: create_ghl_opportunity
- Call this for qualified leads
- Parameters: contact_id, pipeline_stage, value, description
- Returns: { success: boolean, opportunity_id: string }
` : ''}

${settings.logCalls ? '- All calls are automatically logged in GoHighLevel' : ''}
${settings.triggerWorkflows ? '- Specific events will trigger automated workflows' : ''}

Example:
Caller: "Hi, I'm interested in your roofing services. My name is John Smith"
You: "Great to meet you, John! Let me get some information..."
[Collect phone and email]
[Call create_ghl_contact with collected info]
${settings.createOpportunities ? '[Call create_ghl_opportunity if qualified lead]' : ''}
`;
      break;
  }

  if (!integrationInstructions) return;

  // Append integration instructions to prompt
  const updatedPrompt = currentPrompt.compiled_prompt + integrationInstructions;

  // Create new version
  const newVersionNumber = currentPrompt.version_number + 1;
  const { data: newVersion } = await supabase
    .from('prompt_versions')
    .insert({
      agent_id: agentId,
      version_number: newVersionNumber,
      compiled_prompt: updatedPrompt,
      generation_method: 'user_edited',
      parent_version_id: currentPrompt.id,
      change_summary: `Added ${integrationType} integration`,
      token_count: updatedPrompt.split(' ').length
    })
    .select()
    .single();

  if (newVersion) {
    // Update agent's current prompt
    await supabase
      .from('agents')
      .update({ current_prompt_id: newVersion.id })
      .eq('id', agentId);
  }
}
