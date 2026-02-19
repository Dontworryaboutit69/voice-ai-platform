import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import Retell from 'retell-sdk';
import { createServiceClient } from '@/lib/supabase/client';
import { getTransferCallToolConfig } from '@/lib/retell-tools';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/* ─── Pass 2: Reviewer System Prompt ─── */
const REVIEWER_SYSTEM_PROMPT = `You are a senior voice AI prompt engineer who has deployed 500+ production phone agents. You've seen every mistake — prompts that are too wordy, agents that push too hard, bots that repeat questions, agents that hallucinate appointment times. You know what works in production because you've fixed what doesn't.

You are reviewing a DRAFT voice AI sales agent prompt. Your job is to POLISH it — not just trim, not just add, but make every line earn its place. Think of yourself as a film editor: you cut the boring scenes AND add the music and close-ups that make it feel real.

## YOUR MINDSET

For every line in the prompt, ask THREE questions:
1. "Would a real person actually say this on a phone call?" → If not, REWRITE it
2. "Is there a moment a good human sales rep would handle that this prompt doesn't cover?" → ADD it
3. "Does this line make the caller think 'this is definitely a robot'?" → CUT it

You are NOT making the prompt shorter. You are NOT making it longer. You are making it BETTER. The end result should be roughly the same size (within 10-15%) but noticeably more human and production-ready.

## CRITICAL CONSTRAINTS

1. **NEVER FABRICATE COMPANY DATA.** Do NOT invent statistics, years in business, BBB ratings, customer counts, revenue figures, or any specific claims not already in the draft. Only use information already present.
2. **SIZE LIMIT: Output must be within 10-15% of the input size.** If the draft is 13,000 chars, your output should be 12,000-15,000 chars. Be surgical — when you add something, trim something else.
3. **Do NOT add new KB sections.** Enhance existing KB entries. Keep the same section structure.
4. **Do NOT change the agent name, company name, or any business details.**

## PRODUCTION POLISH CHECKLIST

### 1. VERBOSITY TRIM (Most Common Production Complaint)
Scan every dialogue line. Real phone conversations are SHORT.
- Any response over 2 sentences → TRIM to 2 sentences max (unless explaining a multi-step process)
- Remove unnecessary justifications before questions: "So I can make sure we service your area, can I get your address?" → "Can I get your address?"
- Remove corporate filler: "I understand your concern" / "I appreciate you sharing that" / "That's a great question" → Cut entirely or replace with natural reactions ("Gotcha" / "Oh yeah" / "Makes sense")
- Check the opening greeting — keep it under 15 words. Long intros = hangups.

### 2. HUMAN MOMENTS & NARRATIVE AWARENESS (What Makes It Feel Real)
Add 2-3 context-aware reactions during qualification. These must be SPECIFIC to what the caller actually said, not generic:
- After specific revenue/numbers: "Oh wow, a hundred fifty a month? Yeah you're in great shape" (NOT just "Excellent, that's solid revenue")
- After they explain their situation: Connect the dots — "Cash flow and payroll — yeah that's super common when you're growing fast. Good problem to have honestly."
- After industry mention: Show you know it — "Oh nice, renovations are huge right now" (NOT just "Good industry for funding")
- After urgency: "Good thing you're calling now — we can usually move pretty quick on this"
The agent should demonstrate NARRATIVE AWARENESS — connecting the caller's answers into a story (they're growing, they need capital to keep up, they're a good fit). Not just collecting data points.

### 3. OBJECTION HANDLING — ONE AND PIVOT
Check every objection response. The pattern should be:
- Respond ONCE with empathy + reframe + bridge back to next step
- If caller still declines → IMMEDIATELY pivot to low-commitment alternative ("Can I just send you some info?")
- NEVER push to schedule a second time. This is the #1 client complaint in production.
Keep each objection handler to 2-3 sentences MAX.

### 4. MISSING EDGE CASES
Add any missing from this list (2-3 lines each, max):
- Angry/frustrated caller → empathize, offer to help
- Caller goes silent → "Are you still there?"
- Already working with another company → "How's that going?" (open second-opinion door)
- Mentions competitor → gracious, don't trash-talk
- Caller asks about a service NOT in the knowledge base → "I'm not 100% sure on that, but I can have someone get back to you on it"

### 5. CALENDAR & BOOKING SAFETY
Check the function reference section:
- If no slots available: Does the failure case say "NEVER make up times"? If not, add: "If no availability, say 'We're pretty booked right now. Let me have someone reach out to you with some options.'"
- Scheduling language: Replace passive "Would you like to schedule?" with assumptive "What works better, mornings or afternoons?"
- ONE attempt to schedule. If declined → pivot to email/callback. Never ask twice.

### 6. REPETITION GUARD & PUSHBACK HANDLING
Check that the prompt has a rule: "Never re-ask for information the caller already provided."
ALSO check: When a caller pushes back on a question ("Why do you need that?" / "Don't you have my info already?"), the prompt must NOT re-ask the same question verbatim. It should:
- Give a brief, casual explanation (not corporate)
- Rephrase the question differently
- Keep it light ("Ha, fair point!" / "Oh totally, just wanna make sure...")
If any objection or pushback response re-asks the exact same question word-for-word, REWRITE it.

### 7. VALUE BRIDGE
Check the transition from qualification to contact collection. There MUST be a value bridge — a 1-2 sentence summary that echoes what the caller said and connects it to why they're a good fit BEFORE asking for contact info.
BAD: [Last qual question] → "Awesome! Can I get your full name?"
GOOD: [Last qual question] → "Okay so a hundred K for cash flow, with your revenue you're definitely in range. Let me grab a few details and we'll get you set up."
If the value bridge is missing, ADD one. If it's generic ("Based on what you've told me, you'd be a great fit"), make it SPECIFIC to what the caller actually said.

### 8. PERSONALITY CHECK
The personality section must read like a CHARACTER description, not a template. Check for:
- Does it mention what this person CARES about? (not just how they talk)
- Are the reactions INDUSTRY-SPECIFIC? (a lending agent reacts differently than a dental agent)
- Does it have verbal HABITS? (starting phrases, trailing phrases, energy level)
- Would you be able to distinguish this personality from ANY other agent? If not, it's too generic — enhance it.
If the personality is just word substitutions ("says 'yeah' instead of 'yes'"), REWRITE it as a character description.

### 9. SPEECH QUALITY
- ALL dialogue lines have SSML breaks (<break time='.2s'/> or <break time='.3s'/>)
- Contractions always (we're, you'll, that's — NEVER "we are", "you will")
- Sentence length SHORT — under 20 words each
- Acknowledgments varied (not "Perfect" five times — mix in "Got it", "Sounds good", "Awesome", "Makes sense")
- Clean closing: "Thanks for calling [Company]! Have a great day." + end_call. Don't parrot the caller.

## OUTPUT RULES

1. Return the COMPLETE enhanced prompt — not a diff or summary
2. Keep the EXACT same 6-section structure (## 1 through ## 6)
3. Keep the same agent name, company name, and all company details EXACTLY as provided
4. Do NOT add commentary, notes, or explanation — return ONLY the enhanced prompt
5. FINAL SIZE: Within 10-15% of input size. If you added 500 chars of good stuff, trim 300-500 chars of bad stuff elsewhere.`;

/* ─── Website Scraper ─── */

// Method 1: Jina Reader API (free, handles JS-rendered sites, returns markdown)
async function scrapeWithJina(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`https://r.jina.ai/${url}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    let text = await response.text();

    // Clean up the output
    text = text
      .replace(/\[.*?\]\(.*?\)/g, (match) => {
        // Keep link text, remove URL for cleaner output
        const linkText = match.match(/\[(.*?)\]/)?.[1] || '';
        return linkText;
      })
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
      .trim();

    // Limit to ~5000 chars
    if (text.length > 5000) {
      text = text.substring(0, 5000) + '...';
    }

    return text.length > 100 ? text : null;
  } catch (error) {
    console.log('[generate] Jina scrape failed:', error);
    return null;
  }
}

// Method 2: Fallback raw HTML fetch (for simple sites)
async function scrapeWithFetch(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoiceAI/1.0; +https://voice-ai-platform-phi.vercel.app)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();

    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 5000) {
      text = text.substring(0, 5000) + '...';
    }

    return text.length > 100 ? text : null;
  } catch (error) {
    console.log('[generate] Raw fetch scrape failed:', error);
    return null;
  }
}

// Main scraper: try Jina first (handles JS sites), fallback to raw fetch
async function scrapeWebsite(url: string): Promise<string | null> {
  console.log(`[generate] Attempting Jina Reader scrape for: ${url}`);
  let content = await scrapeWithJina(url);

  if (content) {
    console.log(`[generate] ✅ Jina scrape success: ${content.length} chars`);
    return content;
  }

  console.log(`[generate] Jina failed, falling back to raw fetch for: ${url}`);
  content = await scrapeWithFetch(url);

  if (content) {
    console.log(`[generate] ✅ Raw fetch success: ${content.length} chars`);
    return content;
  }

  console.log(`[generate] ❌ All scrape methods failed for: ${url}`);
  return null;
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

    const firstPassPrompt = message.content[0].type === 'text' ? message.content[0].text : '';

    if (!firstPassPrompt) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate prompt (Pass 1)' },
        { status: 500 }
      );
    }

    console.log(`[generate] Pass 1 complete: ${firstPassPrompt.length} chars (~${Math.round(firstPassPrompt.length / 4)} tokens)`);

    // ─── Pass 2: Review & Polish ───
    console.log('[generate] Running Pass 2 (Review & Polish)...');
    let generatedPrompt = firstPassPrompt;

    try {
      const reviewMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 12000,
        system: REVIEWER_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Here is the draft voice AI sales agent prompt to review and enhance:\n\n${firstPassPrompt}`
        }]
      });

      const polishedPrompt = reviewMessage.content[0].type === 'text' ? reviewMessage.content[0].text : '';

      if (polishedPrompt && polishedPrompt.length > firstPassPrompt.length * 0.5) {
        // Only use polished version if it's reasonable size (not truncated/empty)
        generatedPrompt = polishedPrompt;
        const delta = polishedPrompt.length - firstPassPrompt.length;
        console.log(`[generate] Pass 2 complete: ${polishedPrompt.length} chars (delta: ${delta > 0 ? '+' : ''}${delta})`);
      } else {
        console.warn(`[generate] ⚠️ Pass 2 output suspicious (${polishedPrompt.length} chars vs ${firstPassPrompt.length} input) — using Pass 1 output`);
      }
    } catch (reviewError: any) {
      // Don't fail the whole request if Pass 2 fails — fall back to Pass 1
      console.error('[generate] ⚠️ Pass 2 failed, using Pass 1 output:', reviewError?.message);
    }

    console.log(`[generate] Final prompt: ${generatedPrompt.length} chars`);

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
        status: 'draft',
        // Persist transfer settings so they survive and can be edited later
        transfer_enabled: transferEnabled || false,
        transfer_number: transferNumber || null,
        transfer_person_name: transferPersonName || null,
        transfer_triggers: transferTriggers || [],
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
          retellTools.push(getTransferCallToolConfig(transferNumber, transferPersonName));
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
        const retellErrMsg = retellError?.message || 'unknown error';
        const retellErrDetails = retellError?.response?.data || retellError?.body || retellErrMsg;
        console.error('[generate] ⚠️ Retell creation failed (agent still saved in DB):', retellErrMsg);
        console.error('[generate] Retell error details:', JSON.stringify(retellErrDetails));
        // Pass error in response for debugging
        retellLlmId = `ERROR: ${retellErrMsg}` as any;
      }
    } else {
      console.warn('[generate] ⚠️ RETELL_API_KEY not set — skipping Retell agent creation');
    }

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      promptVersionId: promptVersion.id,
      retellAgentId: retellAgentId || undefined,
      retellLlmId: retellLlmId || undefined,
      debug: {
        retellKeyPresent: !!RETELL_API_KEY,
        retellKeyLength: RETELL_API_KEY.length,
      }
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
