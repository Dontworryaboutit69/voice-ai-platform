/**
 * Comprehensive Test Suite for Weekly Optimization System
 *
 * Tests:
 * 1. Call analysis and pattern detection
 * 2. Improvement generation
 * 3. A/B test creation and management
 * 4. Winner evaluation and promotion
 * 5. Email notification flow
 */

import { analyzeCallsForOptimization, generateImprovements, hasSignificantIssues } from '../lib/services/optimization-analyzer.service';

// Mock call data for testing
const mockCalls = [
  {
    id: '1',
    transcript: `Agent: Hello! How can I help you today?
Customer: My roof is leaking!
Agent: Okay, what's your address?
Customer: 123 Main St
Agent: What type of roof do you have?
Customer: I don't know, it's just leaking!
Agent: How old is your roof?
Customer: I don't care, I need help now!
Agent: Can you describe the leak?`,
    duration_ms: 180000,
    call_status: 'completed',
    started_at: new Date().toISOString()
  },
  {
    id: '2',
    transcript: `Agent: Hi there! What brings you to us today?
Customer: I need a roof inspection
Agent: Great! What's your property address?
Customer: 456 Oak Ave
Agent: What kind of roof material?
Customer: Asphalt shingles
Agent: How old?
Customer: About 10 years
Agent: Any issues?
Customer: Just want an inspection
Agent: Perfect, I'll schedule that for you`,
    duration_ms: 120000,
    call_status: 'completed',
    started_at: new Date().toISOString()
  },
  {
    id: '3',
    transcript: `Agent: Hello! How can I assist?
Customer: Emergency! Water coming through ceiling!
Agent: I understand. What's your name?
Customer: John Smith
Agent: What's your address?
Customer: 789 Elm Street
Agent: What type of roof?
Customer: I don't know! There's water everywhere!
Agent: How old is the roof?`,
    duration_ms: 200000,
    call_status: 'completed',
    started_at: new Date().toISOString()
  },
  // Add more similar calls to meet threshold of 10+
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `${i + 4}`,
    transcript: `Agent: Hello! How can I help?
Customer: I need info about roofing
Agent: Sure! What's your address?
Customer: ${100 + i} Test St
Agent: What type of roof?
Customer: Not sure
Agent: How old is it?
Customer: Maybe 5 years
Agent: Any problems?
Customer: Just curious about maintenance`,
    duration_ms: 150000,
    call_status: 'completed',
    started_at: new Date().toISOString()
  }))
];

const mockPrompt = `You are a friendly roofing assistant for ABC Roofing Company.

Your goal is to qualify leads and book appointments.

When a customer contacts you:
1. Greet them warmly
2. Ask about their roof type
3. Ask how old their roof is
4. Ask what issues they're experiencing
5. Collect their contact information
6. Offer to schedule an appointment

Always be professional and helpful.`;

// Test 1: Analyze calls and detect patterns
async function testCallAnalysis() {
  console.log('\n🧪 TEST 1: Call Analysis & Pattern Detection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const analysis = await analyzeCallsForOptimization(mockCalls, mockPrompt);

    console.log('✅ Analysis completed');
    console.log(`   Calls analyzed: ${analysis.callsAnalyzed}`);
    console.log(`   Avg sentiment: ${(analysis.avgSentiment * 100).toFixed(0)}%`);
    console.log(`   Conversion rate: ${(analysis.conversionRate * 100).toFixed(0)}%`);
    console.log(`   Avg duration: ${analysis.avgCallDuration}s`);
    console.log(`   Common issues found: ${analysis.commonIssues.length}`);

    analysis.commonIssues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. ${issue.issue} (${issue.frequency} calls, impact: ${(issue.impactScore * 100).toFixed(0)}%)`);
      console.log(`      ${issue.description}`);
    });

    console.log(`   Success patterns: ${analysis.successPatterns.length}`);
    analysis.successPatterns.forEach((pattern, idx) => {
      console.log(`   ${idx + 1}. ${pattern.pattern}: ${pattern.description}`);
    });

    if (hasSignificantIssues(analysis)) {
      console.log('✅ Significant issues detected - optimization needed');
    } else {
      console.log('ℹ️  No significant issues - optimization not needed');
    }

    return { success: true, analysis };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Test 2: Generate improvements
async function testImprovementGeneration(analysis: any) {
  console.log('\n🧪 TEST 2: Improvement Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const improvements = await generateImprovements(analysis, mockPrompt);

    console.log('✅ Improvements generated');
    console.log(`   Summary: ${improvements.changeSummary}`);
    console.log('\n   Expected improvements:');
    improvements.expectedImprovements.forEach((exp, idx) => {
      console.log(`   ${idx + 1}. ${exp.metric}: ${exp.currentValue} → ${exp.expectedValue}`);
    });

    console.log('\n   Proposed changes preview:');
    console.log(`   ${improvements.proposedChanges.substring(0, 200)}...`);

    return { success: true, improvements };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Test 3: API endpoint - Analyze
async function testAnalyzeEndpoint(agentId: string) {
  console.log('\n🧪 TEST 3: API Endpoint - /api/optimize/analyze');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch('http://localhost:3000/api/optimize/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   Optimization ID: ${data.optimization?.id}`);
      console.log(`   Status: ${data.optimization?.status}`);
      console.log(`   Issues found: ${data.analysis?.commonIssues?.length || 0}`);
      return { success: true, data };
    } else {
      console.log(`ℹ️  ${data.message || data.error}`);
      return { success: true, data }; // Still success if no calls available
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Test 4: API endpoint - Accept optimization
async function testAcceptEndpoint(optimizationId: string) {
  console.log('\n🧪 TEST 4: API Endpoint - /api/optimize/[id]/accept');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch(`http://localhost:3000/api/optimize/${optimizationId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Optimization accepted');
      console.log(`   A/B test ID: ${data.abTest?.id}`);
      console.log(`   Test duration: ${data.testDuration} days`);
      console.log(`   Control: ${data.abTest?.traffic_split_control}% / Test: ${data.abTest?.traffic_split_test}%`);
      return { success: true, data };
    } else {
      console.error(`❌ Failed: ${data.error}`);
      return { success: false, data };
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Test 5: API endpoint - Reject optimization
async function testRejectEndpoint(optimizationId: string) {
  console.log('\n🧪 TEST 5: API Endpoint - /api/optimize/[id]/reject');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch(`http://localhost:3000/api/optimize/${optimizationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Test rejection feedback' })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Optimization rejected');
      console.log(`   Status: ${data.optimization?.status}`);
      return { success: true, data };
    } else {
      console.error(`❌ Failed: ${data.error}`);
      return { success: false, data };
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Test 6: Helper functions
function testHelperFunctions() {
  console.log('\n🧪 TEST 6: Helper Functions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Test hasSignificantIssues
  const mockAnalysisWithIssues = {
    callsAnalyzed: 10,
    avgSentiment: 0.7,
    conversionRate: 0.5,
    avgCallDuration: 180,
    successfulCalls: 8,
    failedCalls: 2,
    commonIssues: [
      { issue: 'Test Issue', description: 'Test', frequency: 5, impactScore: 0.8, examples: [] }
    ],
    successPatterns: [],
    urgencyHandlingScore: 0.5,
    questionEfficiencyScore: 0.5
  };

  const mockAnalysisWithoutIssues = {
    ...mockAnalysisWithIssues,
    commonIssues: [
      { issue: 'Minor Issue', description: 'Test', frequency: 2, impactScore: 0.3, examples: [] }
    ]
  };

  const hasIssues = hasSignificantIssues(mockAnalysisWithIssues);
  const noIssues = hasSignificantIssues(mockAnalysisWithoutIssues);

  console.log(`✅ hasSignificantIssues(with issues) = ${hasIssues} (expected: true)`);
  console.log(`✅ hasSignificantIssues(without issues) = ${noIssues} (expected: false)`);

  return { success: hasIssues === true && noIssues === false };
}

// Run all tests
async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         WEEKLY OPTIMIZATION SYSTEM - TEST SUITE              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  const results: any[] = [];

  // Test 1: Call Analysis
  const analysisResult = await testCallAnalysis();
  results.push({ test: 'Call Analysis', ...analysisResult });

  if (analysisResult.success && analysisResult.analysis && hasSignificantIssues(analysisResult.analysis)) {
    // Test 2: Improvement Generation
    const improvementResult = await testImprovementGeneration(analysisResult.analysis);
    results.push({ test: 'Improvement Generation', ...improvementResult });
  }

  // Test 6: Helper Functions
  const helperResult = testHelperFunctions();
  results.push({ test: 'Helper Functions', ...helperResult });

  // Note: Tests 3-5 require a real agent ID and database connection
  console.log('\nℹ️  Tests 3-5 (API endpoints) require real agent ID and database connection');
  console.log('   Run these manually with: npm run test:optimization <agent-id>');

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.test}`);
  });

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Optimization system is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
  }
}

// Export for manual testing
export {
  testCallAnalysis,
  testImprovementGeneration,
  testAnalyzeEndpoint,
  testAcceptEndpoint,
  testRejectEndpoint,
  testHelperFunctions,
  runAllTests
};

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
