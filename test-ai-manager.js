// Test AI Manager with existing calls
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('🔍 Fetching recent calls...\n');

  // Get recent calls
  const { data: calls, error } = await supabase
    .from('calls')
    .select('id, agent_id, duration_ms, transcript, created_at')
    .not('transcript', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching calls:', error);
    return;
  }

  console.log(`Found ${calls.length} calls with transcripts\n`);

  calls.forEach((call, i) => {
    console.log(`Call ${i + 1}:`);
    console.log(`  ID: ${call.id}`);
    console.log(`  Agent: ${call.agent_id}`);
    console.log(`  Duration: ${(call.duration_ms / 1000).toFixed(1)}s`);
    console.log(`  Transcript length: ${call.transcript?.length || 0} chars`);
    console.log(`  Created: ${call.created_at}`);
    console.log('');
  });

  // Now test evaluation endpoint
  if (calls.length > 0) {
    console.log('🧪 Testing evaluation for first call...\n');

    const testCall = calls[0];
    console.log(`Evaluating call ${testCall.id} (${(testCall.duration_ms / 1000).toFixed(1)}s)\n`);

    // Call the evaluation API via HTTP
    const evaluateUrl = `http://localhost:3000/api/test-evaluate-call?callId=${testCall.id}`;
    console.log(`Calling: ${evaluateUrl}\n`);
  }
}

test();
