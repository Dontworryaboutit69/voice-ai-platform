// Test the new UI flow
async function testNewUI() {
  console.log('🎨 TESTING NEW UI FLOW\n');

  // Create a test agent
  console.log('1. Creating agent...');
  const response = await fetch('http://localhost:3000/api/agents/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Bella Vista Restaurant',
      businessType: 'restaurant',
      description: 'Fine dining Italian restaurant with authentic cuisine',
      website: '',
      location: 'San Francisco, CA',
      callObjective: 'Take reservations, answer menu questions, and handle special requests',
      personalityTone: 'friendly'
    })
  });

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Failed:', data.error);
    return;
  }

  const agentId = data.agentId;
  console.log(`✅ Agent created: ${agentId}\n`);

  console.log('2. Testing new UI routes:\n');
  console.log(`   🔄 Loading page:     http://localhost:3000/agents/${agentId}/generating`);
  console.log(`   📊 Dashboard page:   http://localhost:3000/agents/${agentId}`);
  console.log(`   (Old prompt page):   http://localhost:3000/agents/${agentId}/prompt\n`);

  console.log('✅ New UI is ready to test!\n');
  console.log('Open the loading page in your browser to see the animation, then it will');
  console.log('auto-redirect to the dashboard when the agent is ready.\n');
}

testNewUI().catch(console.error);
