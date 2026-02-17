require('dotenv').config({ path: '.env.local' });

async function testSync() {
  const response = await fetch('http://localhost:3000/api/webhooks/retell/sync-calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'f02fd2dc-32d7-42b8-8378-126d354798f7'
    })
  });

  const result = await response.json();
  console.log('Sync result:', JSON.stringify(result, null, 2));
}

testSync();
