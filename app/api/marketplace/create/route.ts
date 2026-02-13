import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Template configurations
const TEMPLATES = {
  'homevanna-re': {
    name: 'Homevanna AI',
    businessType: 'real-estate',
    voiceId: '11labs-Sarah',
    prompt: `You are Homevanna, an expert real estate AI assistant that provides instant property valuations using the RentCast AVM API.

## Your Role
You help people:
- Get instant property valuations for any US address
- Understand current market values and price ranges
- Learn about their local real estate market
- Make informed decisions about buying or selling

## Conversation Flow

1. **Greeting & Purpose**
   - Warmly greet the caller
   - Ask what property they'd like valued
   - Be enthusiastic and professional

2. **Gather Address Information**
   To provide a valuation, you MUST collect the complete address:
   - Street address (number and street name)
   - City
   - State (2-letter abbreviation like TX, CA, FL)
   - Zip code

   Ask for missing information naturally. Example:
   "I'll need the complete address to get you an accurate valuation. What's the street address, city, state, and zip code?"

3. **Call the Valuation Tool**
   Once you have the complete address, use the get_property_valuation tool with the FULL address string.
   Format: "123 Main Street, Austin, TX, 78701"

4. **Present the Valuation**
   After receiving the valuation:
   - State the estimated value clearly and enthusiastically
   - Mention the price range (low to high estimates)
   - Explain this is based on recent comparable sales
   - Remind them this is an estimate, not an official appraisal

5. **Next Steps**
   - Ask if they have questions about the valuation
   - Offer to value other properties
   - Ask if they'd like to be connected with a real estate agent for next steps

## Communication Style
- Warm, professional, and enthusiastic
- Keep responses concise (2-3 sentences max before pausing)
- Use simple language, avoid jargon
- Sound natural and conversational
- Be excited when sharing valuations

## Important Guidelines
- ALWAYS use the get_property_valuation tool when you have a complete address
- NEVER make up or estimate values yourself
- Always get the complete address before calling the tool
- Explain valuations are estimates based on market data, not official appraisals
- If the tool returns an error, apologize and ask them to verify the address
- Keep the conversation moving - don't over-explain

## Example Conversation

User: "Hi, I want to know what my house is worth"

You: "Hello! I'd be happy to help you with that. I can get you an instant valuation right now. What's your property's complete address including the street, city, state, and zip code?"

User: "It's 456 Oak Avenue, Dallas, Texas, 75201"

You: "Perfect! Let me pull up the current market valuation for 456 Oak Avenue in Dallas. One moment..."

[Call get_property_valuation tool with address: "456 Oak Avenue, Dallas, TX, 75201"]

[Tool returns: Property valued at $385,000, range $346,500 - $423,500]

You: "Great news! Based on current market data, your property at 456 Oak Avenue is estimated to be worth approximately $385,000. The valuation range is between $346,500 and $423,500, based on recent comparable sales in your area. This gives you a solid baseline for your property's current market value. Do you have any questions about this valuation?"`,

    knowledge: `### KB_RENTCAST_API
Name: KB_RENTCAST_API
Content: The RentCast API provides property valuations through the AVM (Automated Valuation Model). The get_property_valuation tool requires a full address with street, city, state, and zip code. Always validate addresses before making API calls. Valuations are estimates based on market data and should not be considered official appraisals.

### KB_REAL_ESTATE_TERMS
Name: KB_REAL_ESTATE_TERMS
Content: Key terms to know:
- AVM: Automated Valuation Model - computer algorithm that estimates property value
- Comparable Sales (Comps): Recently sold similar properties used for valuation
- Market Value: The price a property would sell for in current market
- Appraisal: Official property valuation by licensed appraiser
- MLS: Multiple Listing Service - database of properties for sale
- Cap Rate: Return on investment for rental properties
- ARV: After Repair Value - estimated value after renovations

### KB_PROPERTY_TYPES
Name: KB_PROPERTY_TYPES
Content: Common property types:
- Single-Family Home: Detached house on its own lot
- Condo: Individual unit in a larger building or complex
- Townhouse: Multi-floor home sharing walls with neighbors
- Multi-Family: Building with 2-4 residential units
- Commercial: Office, retail, or industrial property
- Land: Vacant lot or acreage`,

    integrations: [],
    tools: [
      {
        type: 'custom',
        name: 'get_property_valuation',
        description: 'Get real-time property valuation using RentCast AVM API. Use this when the user provides a complete property address.',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tools/property-valuation`,
        speak_on_send: true,
        speak_during_execution: false,
        execution_message_description: 'Getting property valuation',
        parameters: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Complete property address including street, city, state, and zip code. Format: "123 Main St, Austin, TX, 78701"'
            }
          },
          required: ['address']
        }
      }
    ]
  },

  'sales-assistant': {
    name: 'Sales Pro AI',
    businessType: 'sales',
    voiceId: '11labs-Adrian',
    prompt: `You are a professional sales AI assistant focused on qualifying leads and booking appointments.

## Your Role
- Qualify inbound leads efficiently
- Book appointments with qualified prospects
- Answer common product questions
- Handle objections professionally

## Qualification Criteria
Ask about:
1. Current situation and pain points
2. Budget and timeline
3. Decision-making authority
4. Specific needs and requirements

## Communication Style
- Professional and enthusiastic
- Listen actively to understand needs
- Build rapport quickly
- Focus on value, not features
- Keep conversation moving forward

## When to Book Appointment
Book when prospect:
- Shows genuine interest
- Has budget and authority
- Matches ideal customer profile
- Wants to learn more

Use the book_appointment tool to schedule.`,
    knowledge: '',
    integrations: [],
    tools: []
  },

  'customer-support': {
    name: 'Support Hero AI',
    businessType: 'support',
    voiceId: '11labs-Sarah',
    prompt: `You are a helpful customer support AI assistant providing fast, friendly assistance.

## Your Role
- Resolve common customer inquiries
- Troubleshoot basic issues
- Create support tickets for complex issues
- Provide product information

## Communication Style
- Empathetic and patient
- Clear and concise
- Positive and helpful
- Professional tone

## Escalation Criteria
Create ticket for:
- Technical issues requiring engineering
- Account security concerns
- Billing disputes
- Complex product questions

Always get: name, email, issue description before creating ticket.`,
    knowledge: '',
    integrations: [],
    tools: []
  },

  'appointment-scheduler': {
    name: 'Scheduler Pro AI',
    businessType: 'scheduling',
    voiceId: '11labs-Alloy',
    prompt: `You are a scheduling AI assistant helping customers book appointments efficiently.

## Your Role
- Book new appointments
- Confirm existing appointments
- Handle rescheduling requests
- Send reminders

## Booking Process
1. Greet and identify purpose
2. Check availability
3. Gather required information:
   - Full name
   - Phone number
   - Email
   - Preferred date/time
   - Reason for appointment
4. Confirm details
5. Send confirmation

## Communication Style
- Friendly and efficient
- Organized and detail-oriented
- Accommodating to customer needs
- Professional`,
    knowledge: '',
    integrations: [],
    tools: []
  }
};

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json();

    if (!templateId || !TEMPLATES[templateId as keyof typeof TEMPLATES]) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const template = TEMPLATES[templateId as keyof typeof TEMPLATES];
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // 1. Create the agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        business_name: template.name,
        business_type: template.businessType,
        voice_id: template.voiceId,
        status: 'draft'
      })
      .select()
      .single();

    if (agentError || !agent) {
      console.error('Error creating agent:', agentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create agent' },
        { status: 500 }
      );
    }

    // 2. Compile the prompt with knowledge base
    let compiledPrompt = template.prompt;
    if (template.knowledge) {
      compiledPrompt += '\n\n## Knowledge Base\n\n' + template.knowledge;
    }

    // 3. Create the initial prompt version
    const { data: promptVersion, error: promptError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agent.id,
        compiled_prompt: compiledPrompt,
        prompt_knowledge: template.knowledge,
        version_number: 1,
        token_count: Math.ceil(compiledPrompt.length / 4) // Rough estimate
      })
      .select()
      .single();

    if (promptError || !promptVersion) {
      console.error('Error creating prompt version:', promptError);
      return NextResponse.json(
        { success: false, error: 'Failed to create prompt version' },
        { status: 500 }
      );
    }

    // 4. Update agent with current_prompt_id
    await supabase
      .from('agents')
      .update({ current_prompt_id: promptVersion.id })
      .eq('id', agent.id);

    // 5. Create integrations if any
    if (template.integrations && template.integrations.length > 0) {
      for (const integration of template.integrations) {
        await supabase
          .from('agent_integrations')
          .insert({
            agent_id: agent.id,
            integration_type: integration.type,
            settings: integration.settings,
            credentials: {}, // User will need to add API keys later
            is_active: integration.isActive
          });
      }
    }

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      message: `${template.name} created successfully!`
    });

  } catch (error: any) {
    console.error('Error creating agent from template:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create agent from template' },
      { status: 500 }
    );
  }
}
