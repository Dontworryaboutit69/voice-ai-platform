require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTranscripts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: calls } = await supabase
    .from('calls')
    .select('retell_call_id, transcript, transcript_object')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .not('transcript', 'is', null)
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('=== CHECKING CALL TRANSCRIPTS ===\n');

  for (const call of calls || []) {
    console.log(`Call: ${call.retell_call_id}`);
    
    if (call.transcript_object && Array.isArray(call.transcript_object)) {
      const userMessages = call.transcript_object.filter(t => t.role === 'user');
      console.log(`  User messages: ${userMessages.length}`);
      
      // Check for name
      const hasName = userMessages.some(m => 
        m.content && (m.content.toLowerCase().includes('my name is') || m.content.toLowerCase().includes("i'm"))
      );
      
      // Check for phone
      const hasPhone = userMessages.some(m => 
        m.content && /\d{3}.*\d{3}.*\d{4}/.test(m.content)
      );
      
      console.log(`  Has name: ${hasName}`);
      console.log(`  Has phone: ${hasPhone}`);
      
      if (!hasName || !hasPhone) {
        console.log(`  ❌ Missing customer data - won't sync to GHL`);
      } else {
        console.log(`  ✅ Has customer data - should sync`);
      }
    }
    console.log('');
  }
}

checkTranscripts();
