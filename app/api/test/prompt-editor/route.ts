import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  editPromptWithFeedback,
  parsePromptSections,
  compileSections
} from '@/lib/services/prompt-editor.service';

export async function POST() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    const supabase = createServiceClient();

    // Get a real agent and prompt for testing
    const { data: agent } = await supabase
      .from('agents')
      .select('*, current_prompt:prompt_versions!current_prompt_id(*)')
      .eq('id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
      .single();

    if (!agent || !agent.current_prompt) {
      return NextResponse.json({
        error: 'Test agent not found'
      }, { status: 404 });
    }

    const currentPrompt = agent.current_prompt.compiled_prompt;
    const sections = parsePromptSections(currentPrompt);

    // Get framework
    const { data: framework } = await supabase
      .from('framework_instructions')
      .select('instructions')
      .eq('is_active', true)
      .single();

    const frameworkInstructions = framework?.instructions || '';

    console.log('[Test] Starting comprehensive prompt editor tests...');

    // ===== TEST 1: Simple Name Change =====
    console.log('[Test 1] Testing simple name change...');
    const test1Start = Date.now();

    try {
      // Log section lengths BEFORE editing
      console.log('[Test 1] Original section lengths:');
      console.log(`  role: ${sections.role.length} chars`);
      console.log(`  personality: ${sections.personality.length} chars`);
      console.log(`  call_flow: ${sections.call_flow.length} chars`);
      console.log(`  info_recap: ${sections.info_recap.length} chars`);
      console.log(`  functions: ${sections.functions.length} chars`);
      console.log(`  knowledge: ${sections.knowledge.length} chars`);

      const editedSections1 = await editPromptWithFeedback(
        sections,
        "Change the agent's name to Ashley everywhere it appears",
        frameworkInstructions
      );

      const test1Time = Date.now() - test1Start;
      const compiled1 = compileSections(editedSections1);

      // Log section lengths AFTER editing
      console.log('[Test 1] Edited section lengths:');
      console.log(`  role: ${editedSections1.role.length} chars`);
      console.log(`  personality: ${editedSections1.personality.length} chars`);
      console.log(`  call_flow: ${editedSections1.call_flow.length} chars`);
      console.log(`  info_recap: ${editedSections1.info_recap.length} chars`);
      console.log(`  functions: ${editedSections1.functions.length} chars`);
      console.log(`  knowledge: ${editedSections1.knowledge.length} chars`);

      // Check if name was changed
      const hasAshley = compiled1.includes('Ashley');
      const noSarah = !compiled1.includes('Sarah');
      const hasAllHeaders = [
        '## 1. Role & Objective',
        '## 2. Personality',
        '## 3. Call Flow'
      ].every(h => compiled1.includes(h));

      results.tests.push({
        name: 'Simple name change',
        duration_ms: test1Time,
        passed: hasAshley && noSarah && hasAllHeaders,
        details: {
          hasAshley,
          noSarah,
          hasAllHeaders,
          compiledLength: compiled1.length,
          originalLength: currentPrompt.length,
          sectionLengthsBefore: {
            role: sections.role.length,
            personality: sections.personality.length,
            call_flow: sections.call_flow.length,
            info_recap: sections.info_recap.length,
            functions: sections.functions.length,
            knowledge: sections.knowledge.length
          },
          sectionLengthsAfter: {
            role: editedSections1.role.length,
            personality: editedSections1.personality.length,
            call_flow: editedSections1.call_flow.length,
            info_recap: editedSections1.info_recap.length,
            functions: editedSections1.functions.length,
            knowledge: editedSections1.knowledge.length
          }
        }
      });

      console.log(`[Test 1] ✅ Completed in ${test1Time}ms`);
    } catch (error: any) {
      results.tests.push({
        name: 'Simple name change',
        passed: false,
        error: error.message
      });
      console.log(`[Test 1] ❌ Failed: ${error.message}`);
    }

    // ===== TEST 2: Add Content =====
    console.log('[Test 2] Testing adding new content...');
    const test2Start = Date.now();

    try {
      const editedSections2 = await editPromptWithFeedback(
        sections,
        "Add a section about handling pricing questions: always transfer to office manager",
        frameworkInstructions
      );

      const test2Time = Date.now() - test2Start;
      const compiled2 = compileSections(editedSections2);

      const hasPricing = compiled2.toLowerCase().includes('pricing');
      const hasTransfer = compiled2.toLowerCase().includes('transfer');

      results.tests.push({
        name: 'Add new content',
        duration_ms: test2Time,
        passed: hasPricing && hasTransfer,
        details: {
          hasPricing,
          hasTransfer,
          compiledLength: compiled2.length
        }
      });

      console.log(`[Test 2] ✅ Completed in ${test2Time}ms`);
    } catch (error: any) {
      results.tests.push({
        name: 'Add new content',
        passed: false,
        error: error.message
      });
      console.log(`[Test 2] ❌ Failed: ${error.message}`);
    }

    // ===== TEST 3: Remove Content =====
    console.log('[Test 3] Testing removing content...');
    const test3Start = Date.now();

    try {
      const editedSections3 = await editPromptWithFeedback(
        sections,
        "Remove all mentions of cosmetic dentistry services",
        frameworkInstructions
      );

      const test3Time = Date.now() - test3Start;
      const compiled3 = compileSections(editedSections3);

      const noCosmetic = !compiled3.toLowerCase().includes('cosmetic');

      results.tests.push({
        name: 'Remove content',
        duration_ms: test3Time,
        passed: noCosmetic,
        details: {
          noCosmetic,
          compiledLength: compiled3.length
        }
      });

      console.log(`[Test 3] ✅ Completed in ${test3Time}ms`);
    } catch (error: any) {
      results.tests.push({
        name: 'Remove content',
        passed: false,
        error: error.message
      });
      console.log(`[Test 3] ❌ Failed: ${error.message}`);
    }

    // ===== TEST 4: Preserve Untouched Sections =====
    console.log('[Test 4] Testing section preservation...');
    const test4Start = Date.now();

    try {
      const editedSections4 = await editPromptWithFeedback(
        sections,
        "Make the personality section sound more professional",
        frameworkInstructions
      );

      const test4Time = Date.now() - test4Start;

      // Knowledge section should be EXACTLY the same
      const knowledgePreserved = editedSections4.knowledge === sections.knowledge;
      const rolePreserved = editedSections4.role === sections.role;

      results.tests.push({
        name: 'Preserve untouched sections',
        duration_ms: test4Time,
        passed: knowledgePreserved && rolePreserved,
        details: {
          knowledgePreserved,
          rolePreserved,
          personalityChanged: editedSections4.personality !== sections.personality
        }
      });

      console.log(`[Test 4] ✅ Completed in ${test4Time}ms`);
    } catch (error: any) {
      results.tests.push({
        name: 'Preserve untouched sections',
        passed: false,
        error: error.message
      });
      console.log(`[Test 4] ❌ Failed: ${error.message}`);
    }

    // Calculate summary
    const totalTests = results.tests.length;
    const passedTests = results.tests.filter((t: any) => t.passed).length;
    const avgDuration = results.tests
      .filter((t: any) => t.duration_ms)
      .reduce((sum: number, t: any) => sum + t.duration_ms, 0) / totalTests;

    results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      avgDuration_ms: Math.round(avgDuration),
      successRate: `${Math.round((passedTests / totalTests) * 100)}%`
    };

    console.log('[Test] All tests complete');
    console.log(`[Test] Summary: ${passedTests}/${totalTests} passed (${results.summary.successRate})`);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('[Test] Fatal error:', error);
    return NextResponse.json({
      error: error.message,
      results
    }, { status: 500 });
  }
}
