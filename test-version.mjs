const response = await fetch('https://voice-ai-platform-orcin.vercel.app/api/webhooks/retell/sync-calls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentId: 'test' })
});

const data = await response.json();
console.log('Response:', JSON.stringify(data, null, 2));
