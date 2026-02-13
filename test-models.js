/**
 * Test script to verify model selection works
 */

const BASE_URL = 'http://localhost:3000';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function testModelSelection() {
  console.log('\n🧪 Testing Model Selection');
  console.log('─'.repeat(60));

  const models = [
    { id: 'claude-sonnet-4-20250514', name: 'Claude 5.2 Sonnet (Default)' },
    { id: 'claude-opus-4-20250514', name: 'Claude 4.1 Opus Fast' },
    { id: 'gpt-4o', name: 'GPT-4 Omni' }
  ];

  for (const model of models) {
    console.log(`\n📞 Testing with ${model.name}...`);

    try {
      const response = await fetch(`${BASE_URL}/api/agents/${AGENT_ID}/test/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: '11labs-Adrian',
          modelId: model.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`   ✅ ${model.name} works!`);
        console.log(`   Access Token: ${data.accessToken.substring(0, 20)}...`);
      } else {
        console.error(`   ❌ ${model.name} failed: ${data.error}`);
      }
    } catch (error) {
      console.error(`   ❌ Exception: ${error.message}`);
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Model selection test complete!\n');
}

testModelSelection();
