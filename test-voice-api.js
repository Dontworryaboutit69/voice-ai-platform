/**
 * Test script to verify the voice test API works correctly
 */

const BASE_URL = 'http://localhost:3000';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function testVoiceAPI() {
  console.log('\n🧪 Testing Voice Test API');
  console.log('─'.repeat(60));

  try {
    console.log(`\n📞 Creating voice test session for agent ${AGENT_ID}...`);

    const response = await fetch(`${BASE_URL}/api/agents/${AGENT_ID}/test/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voiceId: '11labs-Adrian'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Voice test session created successfully!');
      console.log(`   Access Token: ${data.accessToken.substring(0, 20)}...`);
      console.log(`   Call ID: ${data.callId}`);
      console.log(`   Retell Agent ID: ${data.agentId}`);
      return true;
    } else {
      console.error('❌ Failed to create voice test session');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);

      // Try to get more details from the response
      if (data.details) {
        console.error(`   Details: ${JSON.stringify(data.details, null, 2)}`);
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Exception occurred:');
    console.error(`   ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function testTextAPI() {
  console.log('\n\n💬 Testing Text Test API');
  console.log('─'.repeat(60));

  try {
    console.log(`\n📝 Sending text message to agent ${AGENT_ID}...`);

    const response = await fetch(`${BASE_URL}/api/agents/${AGENT_ID}/test/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hi, I need to book a dental appointment',
        conversationHistory: []
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Text conversation successful!');
      console.log(`   Agent Response: ${data.response.substring(0, 100)}...`);
      return true;
    } else {
      console.error('❌ Failed to get text response');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Exception occurred:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Run tests
(async () => {
  console.log('\n🚀 Starting API Tests...\n');

  const voiceResult = await testVoiceAPI();
  const textResult = await testTextAPI();

  console.log('\n\n📊 Test Results Summary');
  console.log('─'.repeat(60));
  console.log(`Voice API: ${voiceResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Text API:  ${textResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n');

  process.exit(voiceResult && textResult ? 0 : 1);
})();
