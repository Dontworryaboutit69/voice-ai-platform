import Anthropic from '@anthropic-ai/sdk';

// Hardcoded API key as fallback
const ANTHROPIC_API_KEY = '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';

function getAnthropic(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ANTHROPIC_API_KEY
  });
}

interface PromptSections {
  role: string;
  personality: string;
  call_flow: string;
  info_recap: string;
  functions: string;
  knowledge: string;
}

/**
 * BETTER APPROACH: Structured Section Editing
 *
 * Instead of regenerating the entire prompt, we:
 * 1. Identify which section(s) need editing (cheaper, faster)
 * 2. Edit ONLY those sections
 * 3. Keep untouched sections exactly as they are
 * 4. Recompile from sections
 *
 * Benefits:
 * - Lower cost (smaller token counts)
 * - Faster (less processing)
 * - More predictable (only changes what's requested)
 * - Less drift (untouched sections stay perfect)
 */

/**
 * Step 1: Identify which sections the feedback applies to
 */
async function identifyAffectedSections(
  feedback: string,
  currentSections: PromptSections
): Promise<string[]> {
  const anthropic = getAnthropic();

  const analysisPrompt = `You are analyzing user feedback about a voice AI prompt to determine which sections need editing.

USER FEEDBACK:
"${feedback}"

AVAILABLE SECTIONS:
1. role - Agent's role and objective
2. personality - Agent's personality and communication style
3. call_flow - Conversation flow and script
4. info_recap - How to recap information with customer
5. functions - Function calling instructions
6. knowledge - Knowledge base content

Return ONLY a JSON array of section names that need editing based on the feedback.
For example: ["personality", "call_flow"]

If the feedback could apply to multiple sections, include all relevant ones.
If it's unclear, default to the most likely section(s).`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    messages: [{ role: 'user', content: analysisPrompt }]
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '[]';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const sections = JSON.parse(cleaned);
    console.log('[Prompt Editor] Identified affected sections:', sections);
    return Array.isArray(sections) ? sections : [];
  } catch {
    // Fallback: if we can't parse, assume it affects call_flow (most common)
    console.log('[Prompt Editor] Could not parse sections, defaulting to call_flow');
    return ['call_flow'];
  }
}

/**
 * Step 2: Edit a specific section intelligently
 */
async function editSection(
  sectionName: string,
  currentContent: string,
  feedback: string,
  frameworkInstructions: string
): Promise<string> {
  const anthropic = getAnthropic();

  console.log(`[Prompt Editor] Editing ${sectionName} section...`);

  const sectionLabels: Record<string, string> = {
    role: '## 1. Role & Objective',
    personality: '## 2. Personality',
    call_flow: '## 3. Call Flow',
    info_recap: '## 4. Information Recap',
    functions: '## 5. Function Reference',
    knowledge: '## 6. Knowledge Base Setup'
  };

  const editPrompt = `You are editing the "${sectionName}" section of a voice AI prompt based on user feedback.

CURRENT ${sectionName.toUpperCase()} SECTION:
\`\`\`
${currentContent}
\`\`\`

USER FEEDBACK:
"${feedback}"

FRAMEWORK REQUIREMENTS:
${frameworkInstructions}

Your task:
1. Apply the requested changes to this section ONLY
2. REPLACE old content when user wants something changed
3. REMOVE content when user wants something removed
4. ADD content when user wants something new
5. DO NOT duplicate similar instructions
6. Keep the section header: ${sectionLabels[sectionName]}
7. Maintain SSML breaks, [WAIT FOR RESPONSE] patterns, and formatting

Return ONLY the edited section with its header. No explanations, no meta-text, no markdown code blocks.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 3000,
    messages: [{ role: 'user', content: editPrompt }]
  });

  const editedSection = response.content[0].type === 'text' ? response.content[0].text : '';

  if (!editedSection) {
    throw new Error(`Failed to edit ${sectionName} section`);
  }

  console.log(`[Prompt Editor] Successfully edited ${sectionName}`);
  return editedSection;
}

/**
 * Main function: Edit prompt with user feedback (intelligent, section-based editing)
 */
export async function editPromptWithFeedback(
  currentSections: PromptSections,
  feedback: string,
  frameworkInstructions: string
): Promise<PromptSections> {
  console.log('[Prompt Editor] Starting structured section editing...');

  // Step 1: Identify which sections need editing
  const affectedSections = await identifyAffectedSections(feedback, currentSections);

  // Step 2: Edit only the affected sections
  const editedSections = { ...currentSections };

  for (const sectionName of affectedSections) {
    if (sectionName in currentSections) {
      const currentContent = (currentSections as any)[sectionName];
      const editedContent = await editSection(
        sectionName,
        currentContent,
        feedback,
        frameworkInstructions
      );
      (editedSections as any)[sectionName] = editedContent;
    }
  }

  console.log('[Prompt Editor] Section editing complete');
  return editedSections;
}

/**
 * Apply AI Manager suggestion (edit specific sections only)
 */
export async function applyAISuggestion(
  currentSections: PromptSections,
  suggestionChanges: Array<{ section: string; modification: string }>,
  frameworkInstructions: string
): Promise<PromptSections> {
  console.log('[Prompt Editor] Applying AI Manager suggestions...');

  const editedSections = { ...currentSections };

  for (const change of suggestionChanges) {
    const sectionKey = change.section as keyof PromptSections;

    if (sectionKey in currentSections) {
      const currentContent = currentSections[sectionKey];

      // Use editSection to intelligently integrate the change
      const editedContent = await editSection(
        sectionKey,
        currentContent as string,
        change.modification,
        frameworkInstructions
      );

      (editedSections as any)[sectionKey] = editedContent;
    }
  }

  console.log('[Prompt Editor] AI suggestions applied');
  return editedSections;
}

/**
 * Compile sections into final prompt
 */
export function compileSections(sections: PromptSections): string {
  return [
    sections.role,
    sections.personality,
    sections.call_flow,
    sections.info_recap,
    sections.functions,
    sections.knowledge,
  ].filter(Boolean).join('\n\n');
}

/**
 * Parse prompt into sections
 */
export function parsePromptSections(compiledPrompt: string): PromptSections {
  const roleMarker = '## 1. Role & Objective';
  const personalityMarker = '## 2. Personality';
  const callFlowMarker = '## 3. Call Flow';
  const infoRecapMarker = '## 4. Information Recap';
  const functionsMarker = '## 5. Function Reference';
  const knowledgeMarker = '## 6. Knowledge Base Setup';

  const roleStart = compiledPrompt.indexOf(roleMarker);
  const personalityStart = compiledPrompt.indexOf(personalityMarker);
  const callFlowStart = compiledPrompt.indexOf(callFlowMarker);
  const infoRecapStart = compiledPrompt.indexOf(infoRecapMarker);
  const functionsStart = compiledPrompt.indexOf(functionsMarker);
  const knowledgeStart = compiledPrompt.indexOf(knowledgeMarker);

  const extractSection = (startPos: number, endPos: number): string => {
    if (startPos === -1) return '';
    const end = endPos !== -1 ? endPos : compiledPrompt.length;
    return compiledPrompt.substring(startPos, end).trim();
  };

  return {
    role: extractSection(roleStart, personalityStart),
    personality: extractSection(personalityStart, callFlowStart),
    call_flow: extractSection(callFlowStart, infoRecapStart),
    info_recap: extractSection(infoRecapStart, functionsStart),
    functions: extractSection(functionsStart, knowledgeStart),
    knowledge: extractSection(knowledgeStart, -1)
  };
}
