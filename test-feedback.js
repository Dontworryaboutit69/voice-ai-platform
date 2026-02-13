/**
 * Test the feedback/improve endpoint
 */

const BASE_URL = 'http://localhost:3000';
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function testFeedback() {
  console.log('\n🧪 Testing Feedback Improvement');
  console.log('─'.repeat(60));

  try {
    console.log(`\n📝 Submitting feedback to agent ${AGENT_ID}...`);

    const response = await fetch(`${BASE_URL}/api/agents/${AGENT_ID}/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        feedback: 'Make the greeting more casual and friendly'
      })
    });

    const data = await response.json();

    console.log(`\nResponse status: ${response.status}`);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Feedback processed successfully!');
      console.log(`   New Version: ${data.versionNumber}`);
      console.log(`   Change Summary: ${data.changeSummary}`);
      return true;
    } else {
      console.error('\n❌ Failed to process feedback');
      console.error(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error('\n❌ Exception occurred:');
    console.error(`   ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

testFeedback();
