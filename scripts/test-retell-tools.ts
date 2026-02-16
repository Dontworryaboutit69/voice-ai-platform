/**
 * Test script to verify Retell custom tools integration
 *
 * Run with: npx tsx scripts/test-retell-tools.ts
 */

import { getCheckAvailabilityTool, updateRetellAgentTools } from '../lib/retell-tools';

const TEST_AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7'; // Elite Dental
const TEST_RETELL_AGENT_ID = 'agent_123abc'; // Replace with actual Retell agent ID

async function testToolDefinition() {
  console.log('🔍 Testing Retell Custom Tools Integration\n');

  // 1. Test tool generation
  console.log('1️⃣ Generating tool definition...');
  const tool = getCheckAvailabilityTool(TEST_AGENT_ID);
  console.log('✅ Tool generated:');
  console.log(JSON.stringify(tool, null, 2));
  console.log('');

  // 2. Verify structure
  console.log('2️⃣ Verifying tool structure...');
  const checks = [
    { name: 'Has type field', pass: tool.type === 'function' },
    { name: 'Has function name', pass: !!tool.function.name },
    { name: 'Has description', pass: !!tool.function.description },
    { name: 'Has parameters', pass: !!tool.function.parameters },
    { name: 'Has URL', pass: !!tool.function.url },
    { name: 'Parameters have date', pass: !!tool.function.parameters.properties.date },
    { name: 'Date is required', pass: tool.function.parameters.required?.includes('date') },
  ];

  checks.forEach(check => {
    console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  console.log('');

  // 3. Test URL construction
  console.log('3️⃣ Testing URL construction...');
  console.log(`Tool URL: ${tool.function.url}`);
  console.log('');

  // 4. Show what gets sent to Retell
  console.log('4️⃣ What gets sent to Retell API:');
  const retellPayload = {
    agent_id: TEST_RETELL_AGENT_ID,
    custom_tools: [tool]
  };
  console.log(JSON.stringify(retellPayload, null, 2));
  console.log('');

  console.log('✅ Tool definition test complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Get the actual Retell agent ID from the database');
  console.log('2. Connect a calendar integration to trigger registration');
  console.log('3. Check Retell API to verify tool was registered');
  console.log('4. Make a test call and ask about availability');
}

testToolDefinition().catch(console.error);
