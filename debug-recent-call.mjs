import Retell from 'retell-sdk';

const retell = new Retell({
  apiKey: 'key_85da79d1d9da73aee899af323f23'
});

console.log('🔍 Checking your most recent call in detail...\n');

try {
  const call = await retell.call.retrieve('call_8a6ae51f115dd6c9e6a3bf69bda');

  console.log('Call Details:');
  console.log('============');
  console.log('Call ID:', call.call_id);
  console.log('Agent ID:', call.agent_id);
  console.log('Status:', call.call_status);
  console.log('Metadata:', JSON.stringify(call.metadata, null, 2));
  console.log('');
  
  if (call.metadata && call.metadata.agent_id) {
    console.log('✅ Metadata contains agent_id:', call.metadata.agent_id);
    console.log('');
    console.log('🔍 Checking if this call is in database...');
    
    // Check database
    const response = await fetch(
      `https://qoendwnzpsmztgonrxzq.supabase.co/rest/v1/calls?retell_call_id=eq.call_8a6ae51f115dd6c9e6a3bf69bda`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
        }
      }
    );
    
    const dbData = await response.json();
    
    if (dbData.length > 0) {
      console.log('✅ Call found in database!');
      console.log('Database record:', JSON.stringify(dbData[0], null, 2));
    } else {
      console.log('❌ Call NOT in database');
      console.log('');
      console.log('This means the webhook was NOT called or failed silently.');
    }
  } else {
    console.log('❌ No agent_id in metadata - webhook will fail!');
  }

} catch (error) {
  console.error('Error:', error.message);
}
