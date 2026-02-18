import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/* ─── Website Scraper ─── */
async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoiceAI/1.0; +https://voice-ai-platform-phi.vercel.app)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();

    // Strip HTML to plain text
    let text = html
      // Remove script and style blocks entirely
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to ~4000 chars to avoid overwhelming the prompt
    if (text.length > 4000) {
      text = text.substring(0, 4000) + '...';
    }

    return text.length > 50 ? text : null; // Skip if too short to be useful
  } catch (error) {
    console.log('[generate] Website scrape failed:', error);
    return null;
  }
}

/* ─── Section Parser ─── */
interface PromptSections {
  role: string;
  personality: string;
  call_flow: string;
  info_recap: string;
  functions: string;
  knowledge: string;
}

function parsePromptSections(compiledPrompt: string): PromptSections {
  // Flexible patterns matching various heading formats from Claude's output
  const sectionPatterns: { key: keyof PromptSections; patterns: RegExp[] }[] = [
    {
      key: 'role',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Role(?:\s*(?:&|and)\s*Objective)?/mi,
        /^\*{2}(?:\d+\.?\s*)?Role(?:\s*(?:&|and)\s*Objective)?\*{2}/mi,
      ]
    },
    {
      key: 'personality',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Personality/mi,
        /^\*{2}(?:\d+\.?\s*)?Personality\*{2}/mi,
      ]
    },
    {
      key: 'call_flow',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Call\s*Flow/mi,
        /^\*{2}(?:\d+\.?\s*)?Call\s*Flow\*{2}/mi,
        /^#{1,3}\s*(?:\d+\.?\s*)?Critical\s*Rules/mi,
      ]
    },
    {
      key: 'info_recap',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Info(?:rmation)?\s*Recap/mi,
        /^\*{2}(?:\d+\.?\s*)?Info(?:rmation)?\s*Recap\*{2}/mi,
        /^#{1,3}\s*(?:\d+\.?\s*)?Appointment\s*Confirmation/mi,
      ]
    },
    {
      key: 'functions',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Function\s*(?:Reference|Calling)?/mi,
        /^\*{2}(?:\d+\.?\s*)?Function\s*(?:Reference|Calling)?\*{2}/mi,
        /^#{1,3}\s*(?:\d+\.?\s*)?Functions/mi,
      ]
    },
    {
      key: 'knowledge',
      patterns: [
        /^#{1,3}\s*(?:\d+\.?\s*)?Knowledge\s*Base/mi,
        /^\*{2}(?:\d+\.?\s*)?Knowledge\s*Base\*{2}/mi,
        /^#{1,3}\s*(?:\d+\.?\s*)?KNOWLEDGE\s*BASE/mi,
      ]
    },
  ];

  // Find positions
  const sectionPositions: { key: keyof PromptSections; pos: number }[] = [];
  for (const { key, patterns } of sectionPatterns) {
    for (const pattern of patterns) {
      const match = pattern.exec(compiledPrompt);
      if (match) {
        sectionPositions.push({ key, pos: match.index });
        break;
      }
    }
  }

  sectionPositions.sort((a, b) => a.pos - b.pos);

  const result: PromptSections = {
    role: '',
    personality: '',
    call_flow: '',
    info_recap: '',
    functions: '',
    knowledge: '',
  };

  for (let i = 0; i < sectionPositions.length; i++) {
    const { key, pos } = sectionPositions[i];
    const endPos = i + 1 < sectionPositions.length
      ? sectionPositions[i + 1].pos
      : compiledPrompt.length;
    result[key] = compiledPrompt.substring(pos, endPos).trim();
  }

  // Fallback: if nothing parsed, put everything in call_flow so nothing is lost
  if (sectionPositions.length === 0) {
    result.call_flow = compiledPrompt.trim();
  }

  // If there's content before the first section header, use it as role
  if (!result.role && sectionPositions.length > 0 && sectionPositions[0].pos > 0) {
    result.role = compiledPrompt.substring(0, sectionPositions[0].pos).trim();
  }

  return result;
}

/* ─── Main Route ─── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Step 1: Business
      businessName,
      businessType,
      description,
      website,
      location,
      agentName,
      ownerName,
      // Step 2: Goal
      callGoal,
      // Step 3: Transfers
      transferEnabled,
      transferNumber,
      transferPersonName,
      transferTriggers,
      // Step 4: Sales Process + Data
      qualificationQuestions,
      qualificationCriteria,
      callFlowDescription,
      dataCollectionFields,
      // Step 5: Objections
      objections,
      // Step 6: Personality
      personalityTone,
      personalityNotes,
    } = body;

    // Validate required fields
    if (!businessName || !businessType || !description || !location || !callGoal) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get framework instructions
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

    // Scrape website if provided
    let websiteContent: string | null = null;
    if (website) {
      console.log(`[generate] Scraping website: ${website}`);
      websiteContent = await scrapeWebsite(website);
      if (websiteContent) {
        console.log(`[generate] Scraped ${websiteContent.length} chars from website`);
      } else {
        console.log(`[generate] No content scraped from website`);
      }
    }

    // Build the goal description
    const goalDescriptions: Record<string, string> = {
      book_appointments: 'Qualify inbound callers and book them into the calendar. Collect required info, check availability, and confirm the appointment.',
      collect_info: 'Collect caller details (name, phone, project info) so the team can follow up. No calendar booking — just gather info and let them know someone will call back.',
      answer_and_route: 'Answer common questions about the business. Transfer to a live person when the caller has a question the AI cannot answer or when they request a human.',
      screen_and_transfer: 'Greet callers, ask a few basic screening questions, then transfer to a live person.',
    };

    // Build transfer config text
    let transferConfig = '';
    if (transferEnabled && transferNumber) {
      const triggerDescriptions: Record<string, string> = {
        customer_requests: 'Customer explicitly asks to speak with a real person',
        existing_customer: 'Caller identifies as an existing customer',
        cant_answer: 'Caller asks a question the AI cannot answer',
        emergency: 'Urgent or emergency situation',
      };
      const triggers = (transferTriggers || [])
        .map((t: string) => triggerDescriptions[t] || t)
        .join(', ');

      transferConfig = `
TRANSFER SETUP:
- Transfer to: ${transferPersonName || 'team member'} at ${transferNumber}
- Transfer when: ${triggers || 'Customer requests a real person'}
- If transfer fails: Take caller's name and phone number for a callback.`;
    }

    // Build data collection text
    const fieldLabels: Record<string, string> = {
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      address: 'Address',
      service_requested: 'Service/Project Type',
      company: 'Company Name',
      insurance: 'Insurance Info',
    };
    const fieldsToCollect = (dataCollectionFields || ['name', 'phone', 'email'])
      .map((f: string) => fieldLabels[f] || f)
      .join(', ');

    // Build objections text
    let objectionsConfig = '';
    if (objections && Array.isArray(objections) && objections.length > 0) {
      const objectionLines = objections
        .filter((o: { objection: string; response: string }) => o.objection.trim())
        .map((o: { objection: string; response: string }, i: number) =>
          `${i + 1}. Caller says: "${o.objection}"\n   Agent responds: "${o.response || '(handle naturally)'}"`)
        .join('\n');
      if (objectionLines) {
        objectionsConfig = `\nCOMMON OBJECTIONS — MUST include ALL of these as [IF:] branches in the call flow. Use the exact response provided for each one:
${objectionLines}`;
      }
    }

    // Build sales process context
    let salesProcessContext = '';
    if (qualificationQuestions || qualificationCriteria || callFlowDescription) {
      salesProcessContext = `\nSALES PROCESS (THIS IS CRITICAL — use this to build the call flow):`;
      if (qualificationQuestions) {
        salesProcessContext += `\n\nQUALIFICATION QUESTIONS the agent MUST ask before booking/transferring:
${qualificationQuestions}`;
      }
      if (qualificationCriteria) {
        salesProcessContext += `\n\nQUALIFICATION CRITERIA — who is qualified vs. not:
${qualificationCriteria}
The call flow MUST include decision gates based on these criteria. If someone qualifies → proceed to booking/transfer. If not → redirect appropriately (partner program, follow-up email, etc.)`;
      }
      if (callFlowDescription) {
        salesProcessContext += `\n\nIDEAL CALL FLOW described by the business owner:
${callFlowDescription}
Use this as the blueprint for the call flow section. The business owner knows their process — follow their described flow and add proper [IF:] branching, [WAIT FOR RESPONSE], and SSML breaks.`;
      }
    }

    // Build the user prompt with all context
    const userPrompt = `Generate a production-ready SALES voice agent prompt for this business. This is NOT a receptionist — it's a sales agent that qualifies, routes, and closes.

BUSINESS:
- Name: ${businessName}
- Industry: ${businessType}
- Services: ${description}
- Service Area: ${location}
${website ? `- Website: ${website}` : ''}
${ownerName ? `- Owner/Contact: ${ownerName}` : ''}

AI AGENT:
- Name: ${agentName || '(pick a natural female name)'}
- Personality: ${personalityTone}${personalityNotes ? ` — ${personalityNotes}` : ''}

CALL GOAL:
${goalDescriptions[callGoal] || callGoal}

CONTACT INFO TO COLLECT:
${fieldsToCollect}
${transferConfig}${salesProcessContext}${objectionsConfig}
${websiteContent ? `
WEBSITE CONTENT (use this for real business details — services, team members, hours, address, etc.):
${websiteContent}
` : ''}
Generate the complete prompt now. Use the 6-section structure. Use REAL details from the website content above — do NOT invent fake team members, addresses, hours, or services. If the website content doesn't include something, leave it out rather than making it up.

CRITICAL REQUIREMENTS:
1. BUILD A SALES AGENT, NOT A RECEPTIONIST. The call flow must have qualification questions, decision gates, and different paths for qualified vs. unqualified callers. Do NOT just collect contact info and book — that's a receptionist.
2. If qualification questions were provided, they MUST appear in the call flow as actual questions the agent asks, with [IF:] branching based on the answers.
3. If qualification criteria were provided, use them as decision gates: qualified callers get one path (transfer/book), unqualified callers get another (partner program/email follow-up/redirect).
4. If an ideal call flow was described, use it as the BLUEPRINT. Follow the business owner's process.
5. ${!qualificationQuestions && !callFlowDescription ? `No sales process was provided by the user, so YOU must infer one based on the industry. For a ${businessType} business doing "${description}", research what qualification questions are standard, what disqualifies someone, and what a typical sales call flow looks like. Build qualification into the call flow.` : 'The sales process details above must be reflected in the call flow.'}
6. The call flow MUST include brief acknowledgments between topic shifts.
7. The call flow MUST include ALL edge cases: AI disclosure, transfer failure, off-topic redirect, unclear caller intent, and caller not ready/just browsing.
8. The closing MUST include "Is there anything else I can help you with?" + goodbye + end_call.
9. COMPLETE every section fully — do not truncate.
10. ALL user-provided objections MUST appear as [IF:] branches using the exact responses provided.
11. The Knowledge Base should be thorough with real data, service descriptions, FAQs, and process info.`;

    console.log('[generate] Calling Claude API...');
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
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

    console.log(`[generate] Generated prompt: ${generatedPrompt.length} chars`);

    // Demo org (no auth yet)
    const demoOrgId = '00000000-0000-0000-0000-000000000001';
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

    // Create agent
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

    // Parse sections using markdown header parser (not substring!)
    const sections = parsePromptSections(generatedPrompt);
    console.log(`[generate] Parsed sections:`, Object.entries(sections).map(([k, v]) => `${k}: ${v.length} chars`));

    // Create prompt version
    const { data: promptVersion, error: promptError } = await supabase
      .from('prompt_versions')
      .insert({
        agent_id: agent.id,
        version_number: 1,
        prompt_role: sections.role || '',
        prompt_personality: sections.personality || '',
        prompt_call_flow: sections.call_flow || '',
        prompt_info_recap: sections.info_recap || '',
        prompt_functions: sections.functions || '[]',
        prompt_knowledge: sections.knowledge || '',
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

    // Link prompt to agent
    await supabase
      .from('agents')
      .update({ current_prompt_id: promptVersion.id })
      .eq('id', agent.id);

    // Create data collection config
    if (dataCollectionFields && Array.isArray(dataCollectionFields) && dataCollectionFields.length > 0) {
      const fieldLabelMap: Record<string, string> = {
        'name': 'Customer Name',
        'phone': 'Phone Number',
        'email': 'Email Address',
        'service_requested': 'Service Requested',
        'address': 'Address',
        'company': 'Company Name',
        'insurance': 'Insurance Info',
      };

      const fields = dataCollectionFields.map((fieldId: string) => ({
        id: fieldId,
        type: fieldId === 'phone' ? 'phone' : fieldId === 'email' ? 'email' : 'text',
        label: fieldLabelMap[fieldId] || fieldId,
        required: ['name', 'phone'].includes(fieldId),
        enabled: true,
        isCustom: false,
      }));

      await supabase
        .from('agent_data_collection_configs')
        .insert({
          agent_id: agent.id,
          fields,
          retell_analysis_config: {
            extract_fields: fields.map((f: { id: string; label: string; type: string; required: boolean }) => ({
              name: f.id,
              label: f.label,
              type: f.type,
              required: f.required,
            })),
          },
        });

      console.log(`[generate] Created data collection config with ${fields.length} fields`);
    }

    // ─── Create Retell LLM + Agent ───
    let retellAgentId: string | null = null;
    let retellLlmId: string | null = null;

    if (RETELL_API_KEY) {
      try {
        const retell = new Retell({ apiKey: RETELL_API_KEY });

        // Strip SSML tags for LLM (they're in the prompt for reference but Retell handles TTS separately)
        const promptForRetell = generatedPrompt.replace(/<[^>]*>/g, '');

        // Build tools array — always include end_call
        const retellTools: any[] = [
          {
            type: 'end_call',
            name: 'end_call',
            description: 'End the call when the conversation is complete, customer says goodbye, or all tasks are done.',
          },
        ];

        // Add transfer tool if transfers are enabled
        if (transferEnabled && transferNumber) {
          retellTools.push({
            type: 'transfer_call',
            name: 'transfer_call',
            description: `Transfer the call to ${transferPersonName || 'a team member'} when the caller requests a live person or meets transfer criteria.`,
            number: transferNumber,
          });
        }

        // Step 1: Create Retell LLM
        console.log('[generate] Creating Retell LLM...');
        const llm = await retell.llm.create({
          general_prompt: promptForRetell,
          model: 'gpt-4.1-fast',
          general_tools: retellTools,
        });
        retellLlmId = llm.llm_id;
        console.log(`[generate] ✅ Created Retell LLM: ${retellLlmId}`);

        // Step 2: Create Retell Agent
        // ALWAYS use production URL for Retell webhooks — localhost will never work for real calls
        // NEXT_PUBLIC_APP_URL is localhost in dev, so we skip it here intentionally
        const PRODUCTION_URL = 'https://voice-ai-platform-phi.vercel.app';
        const webhookBaseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : PRODUCTION_URL;

        console.log('[generate] Creating Retell Agent...');
        const retellAgent = await retell.agent.create({
          agent_name: businessName,
          voice_id: '11labs-Cimo',
          language: 'en-US',
          webhook_url: `${webhookBaseUrl}/api/webhooks/retell/call-events`,
          response_engine: {
            type: 'retell-llm',
            llm_id: retellLlmId,
          },
        });
        retellAgentId = retellAgent.agent_id;
        console.log(`[generate] ✅ Created Retell Agent: ${retellAgentId}`);

        // Step 3: Save Retell IDs back to our database
        await supabase
          .from('agents')
          .update({
            retell_agent_id: retellAgentId,
            retell_llm_id: retellLlmId,
          })
          .eq('id', agent.id);

        console.log(`[generate] ✅ Saved Retell IDs to database`);
      } catch (retellError: any) {
        // Don't fail the whole request if Retell creation fails
        // The agent is still created in our DB and the prompt is saved
        console.error('[generate] ⚠️ Retell creation failed (agent still saved in DB):', retellError?.message);
      }
    } else {
      console.warn('[generate] ⚠️ RETELL_API_KEY not set — skipping Retell agent creation');
    }

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      promptVersionId: promptVersion.id,
      retellAgentId: retellAgentId || undefined,
    });

  } catch (error: any) {
    console.error('Error generating prompt:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
