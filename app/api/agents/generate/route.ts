import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/client';

// API key - hardcoded temporarily to fix Turbopack env var issue
const ANTHROPIC_API_KEY = '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';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, businessType, description, website, location, callObjective, personalityTone, dataCollectionFields } = body;

    // Validate required fields
    if (!businessName || !businessType || !description || !location || !callObjective) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createServiceClient();

    // Get the framework instructions from database
    const { data: framework, error: frameworkError } = await supabase
      .from('framework_instructions')
      .select('instructions')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (frameworkError || !framework) {
      console.error('Framework error:', frameworkError);
      return NextResponse.json(
        { success: false, error: 'Failed to load framework instructions' },
        { status: 500 }
      );
    }

    // Generate prompt using Claude
    const userPrompt = `Generate a production-ready Retell AI voice agent prompt for this business:

Business Name: ${businessName}
Business Type: ${businessType}
Services: ${description}
${website ? `Website: ${website}` : ''}
Service Area: ${location}
Call Objective: ${callObjective}
Personality Tone: ${personalityTone}

Please generate a complete voice agent prompt following the 6-section structure (Role, Personality, Call Flow, Info Recap, Functions, Knowledge Base). Make it natural, conversational, and production-ready.`;

    console.log('Calling Claude API...');
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: framework.instructions,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const generatedPrompt = message.content[0].type === 'text' ? message.content[0].text : '';

    if (!generatedPrompt) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate prompt' },
        { status: 500 }
      );
    }

    // Create a demo organization if none exists (for now, we'll use a fixed UUID)
    // In production, this would come from auth
    const demoOrgId = '00000000-0000-0000-0000-000000000001';

    // Check if demo org exists, create if not
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', demoOrgId)
      .single();

    if (!existingOrg) {
      await supabase
        .from('organizations')
        .insert({
          id: demoOrgId,
          name: 'Demo Organization',
          slug: 'demo-org'
        });
    }

    // Create agent record with unique slug
    const baseSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${Date.now()}`;

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        organization_id: demoOrgId,
        name: businessName,
        slug,
        business_name: businessName,
        business_type: businessType,
        business_description: description,
        website,
        service_area: location,
        status: 'draft'
      })
      .select()
      .single();

    if (agentError || !agent) {
      console.error('Agent creation error:', agentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create agent' },
        { status: 500 }
      );
    }

    // Parse the generated prompt into sections (simplified for now)
    // In production, you'd parse this more carefully
    const sections = {
      role: generatedPrompt.substring(0, 500),
      personality: generatedPrompt.substring(500, 800),
      call_flow: generatedPrompt.substring(800, 1600),
      info_recap: generatedPrompt.substring(1600, 1800),
      functions: '[]',
      knowledge: generatedPrompt.substring(1800)
    };

    // Create first prompt version
    const { data: promptVersion, error: promptError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agent.id,
        version_number: 1,
        prompt_role: sections.role,
        prompt_personality: sections.personality,
        prompt_call_flow: sections.call_flow,
        prompt_info_recap: sections.info_recap,
        prompt_functions: sections.functions,
        prompt_knowledge: sections.knowledge,
        compiled_prompt: generatedPrompt,
        generation_method: 'ai_generated',
        token_count: generatedPrompt.split(' ').length
      })
      .select()
      .single();

    if (promptError || !promptVersion) {
      console.error('Prompt version error:', promptError);
      return NextResponse.json(
        { success: false, error: 'Failed to save prompt' },
        { status: 500 }
      );
    }

    // Update agent with current prompt
    await supabase
      .from('agents')
      .update({ current_prompt_id: promptVersion.id })
      .eq('id', agent.id);

    // Create data collection config if fields were selected
    if (dataCollectionFields && Array.isArray(dataCollectionFields) && dataCollectionFields.length > 0) {
      const fieldLabelMap: Record<string, string> = {
        'name': 'Customer Name',
        'phone': 'Phone Number',
        'email': 'Email Address',
        'service_requested': 'Service Requested',
        'address': 'Address',
        'company': 'Company Name',
        'preferred_contact_time': 'Preferred Contact Time',
      };

      const fields = dataCollectionFields.map((fieldId: string) => ({
        id: fieldId,
        type: fieldId === 'phone' ? 'phone' : fieldId === 'email' ? 'email' : 'text',
        label: fieldLabelMap[fieldId] || fieldId,
        required: ['name', 'phone', 'email'].includes(fieldId), // Mark common fields as required
        enabled: true,
        isCustom: false,
      }));

      await supabase
        .from('agent_data_collection_configs')
        .insert({
          agent_id: agent.id,
          fields,
          retell_analysis_config: {
            extract_fields: fields.map(f => ({
              name: f.id,
              label: f.label,
              type: f.type,
              required: f.required,
            })),
          },
        });

      console.log(`[generate] Created data collection config for agent ${agent.id} with ${fields.length} fields`);
    }

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      promptVersionId: promptVersion.id
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
