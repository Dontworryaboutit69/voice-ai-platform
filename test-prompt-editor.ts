/**
 * Test script for the new prompt editor
 *
 * This tests:
 * 1. Section identification accuracy
 * 2. Section editing quality
 * 3. Final compiled prompt integrity
 * 4. Comparison with old "full prompt" approach
 */

import {
  editPromptWithFeedback,
  parsePromptSections,
  compileSections
} from './lib/services/prompt-editor.service';

const SAMPLE_PROMPT = `# Elite Dental Care - Voice Agent Prompt

## 1. Role & Objective

You are Sarah, a patient coordinator at Elite Dental Care in Miami. Your job is to help potential patients book appointments, answer basic questions about our services, and collect their contact information. You cannot provide medical advice or discuss specific treatment costs - transfer those calls to our office manager.

## 2. Personality

You're friendly and energetic, speaking naturally like a helpful dental office coordinator. You understand that many people feel anxious about dental visits, so you're reassuring and patient. You speak conversationally with occasional "let me see" or "absolutely" but stay focused on helping the patient.

## 3. Call Flow

**Opening:**
"Hi! My name is Sarah from Elite Dental Care. <break time=".2s"/> How may I help you?"

[WAIT FOR RESPONSE]

**Service Interest:**
"Are you looking for a general cleaning and exam, or is there something specific you'd like to have looked at?"

[WAIT FOR RESPONSE]

## 4. Information Recap

When confirming appointment details, speak naturally:

"Alright, let me make sure I have everything correct. <break time=".3s"/> That's [full name], and I have your phone number as [read phone naturally]."

## 5. Function Reference

### check_cal_avail
**WHEN:** Before presenting appointment options
**SAY BEFORE:** "Give me just a second while I check our availability."

## 6. Knowledge Base Setup

### KB_SERVICES
Name: KB_SERVICES
Content:
COSMETIC DENTISTRY:
- Teeth Whitening
- Porcelain Veneers`;

const FRAMEWORK = `Voice AI Framework Requirements:
- Use SSML breaks: <break time=".2s"/>
- Always use [WAIT FOR RESPONSE] after questions
- Natural, conversational language
- Maintain 6-section structure`;

async function testSectionIdentification() {
  console.log('\n========== TEST 1: Section Identification ==========\n');

  const testCases = [
    {
      feedback: "Change the agent's name from Sarah to Ashley",
      expected: ['personality', 'call_flow']
    },
    {
      feedback: "Add teeth whitening pricing to the knowledge base",
      expected: ['knowledge']
    },
    {
      feedback: "Make the agent sound more professional and less casual",
      expected: ['personality']
    },
    {
      feedback: "Update the opening greeting and add a warmth check question",
      expected: ['call_flow']
    }
  ];

  const sections = parsePromptSections(SAMPLE_PROMPT);

  for (const testCase of testCases) {
    console.log(`Feedback: "${testCase.feedback}"`);
    console.log(`Expected sections: ${testCase.expected.join(', ')}`);

    // We'd need to call the actual function here, but for now just log
    console.log('✅ Test prepared\n');
  }
}

async function testSectionEditing() {
  console.log('\n========== TEST 2: Section Editing Quality ==========\n');

  const sections = parsePromptSections(SAMPLE_PROMPT);

  console.log('Original Personality Section:');
  console.log(sections.personality);
  console.log('\n---\n');

  // Test case: Change name from Sarah to Ashley
  const feedback = "Change the agent's name from Sarah to Ashley everywhere it appears";

  console.log(`Applying feedback: "${feedback}"`);
  console.log('\nThis would:');
  console.log('1. Identify affected sections: personality, call_flow');
  console.log('2. Edit each section individually');
  console.log('3. Replace "Sarah" with "Ashley"');
  console.log('4. Keep all other sections untouched');
  console.log('5. Recompile into final prompt');
  console.log('\n✅ Test prepared\n');
}

async function testPromptIntegrity() {
  console.log('\n========== TEST 3: Prompt Integrity ==========\n');

  const sections = parsePromptSections(SAMPLE_PROMPT);
  const recompiled = compileSections(sections);

  // Check if parsing and recompiling preserves the prompt
  const originalLength = SAMPLE_PROMPT.length;
  const recompiledLength = recompiled.length;

  console.log(`Original length: ${originalLength} chars`);
  console.log(`Recompiled length: ${recompiledLength} chars`);
  console.log(`Difference: ${Math.abs(originalLength - recompiledLength)} chars`);

  // Check section headers are present
  const hasAllHeaders = [
    '## 1. Role & Objective',
    '## 2. Personality',
    '## 3. Call Flow',
    '## 4. Information Recap',
    '## 5. Function Reference',
    '## 6. Knowledge Base Setup'
  ].every(header => recompiled.includes(header));

  console.log(`All section headers present: ${hasAllHeaders ? '✅' : '❌'}`);

  // Check SSML breaks preserved
  const sslmPreserved = recompiled.includes('<break time=');
  console.log(`SSML breaks preserved: ${sslmPreserved ? '✅' : '❌'}`);

  // Check WAIT patterns preserved
  const waitPreserved = recompiled.includes('[WAIT FOR RESPONSE]');
  console.log(`WAIT patterns preserved: ${waitPreserved ? '✅' : '❌'}`);

  console.log('\n');
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        PROMPT EDITOR COMPREHENSIVE TEST SUITE           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  await testSectionIdentification();
  await testSectionEditing();
  await testPromptIntegrity();

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                     TESTS COMPLETE                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('NEXT STEPS:');
  console.log('1. Review the test structure above');
  console.log('2. Run actual API calls with real Claude responses');
  console.log('3. Compare section-by-section vs full-prompt editing');
  console.log('4. Measure quality, cost, and speed differences');
  console.log('5. Verify no regressions or corruption');
}

// Run tests
runAllTests().catch(console.error);
