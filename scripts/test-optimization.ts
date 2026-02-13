#!/usr/bin/env ts-node

/**
 * Test Runner for Weekly Optimization System
 *
 * Usage:
 *   npm run test:optimization              # Run unit tests only
 *   npm run test:optimization <agent-id>   # Run all tests including API
 */

import { runAllTests, testAnalyzeEndpoint, testAcceptEndpoint } from '../tests/optimization-system.test';

async function main() {
  const agentId = process.argv[2];

  if (!agentId) {
    console.log('Running unit tests only (no agent ID provided)...\n');
    await runAllTests();
    return;
  }

  console.log(`Running full test suite with agent ID: ${agentId}\n`);

  // Run unit tests first
  await runAllTests();

  console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                   API INTEGRATION TESTS                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Test API endpoints
  const analyzeResult = await testAnalyzeEndpoint(agentId);

  if (analyzeResult.success && analyzeResult.data?.optimization?.id) {
    const optimizationId = analyzeResult.data.optimization.id;

    if (analyzeResult.data.optimization.status === 'pending') {
      await testAcceptEndpoint(optimizationId);
    }
  }

  console.log('\n🏁 All tests completed!');
}

main().catch(console.error);
