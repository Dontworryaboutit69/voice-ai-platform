import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const dentalAgentId = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

console.log('\n🧪 Testing direct insert...\n');

const testCallData = {
  retell_call_id: 'call_ef22574922e3fd61e8905d9a4a3',
  agent_id: dentalAgentId,
  from_number: '+1234567890',
  to_number: '+0987654321',
  started_at: '2026-02-14T06:20:51.184Z',
  ended_at: '2026-02-14T06:21:34.240Z',
  duration_ms: 43056,
  transcript: 'Test transcript',
  transcript_object: null,
  recording_url: 'https://example.com/recording.mp3',
  call_status: 'completed',
  call_analysis: null
};

const { data, error } = await supabase
  .from('calls')
  .insert(testCallData);

if (error) {
  console.log('❌ Insert error:', error);
} else {
  console.log('✅ Insert successful:', data);
}

// Check if it's there
const { data: checkData } = await supabase
  .from('calls')
  .select('*')
  .eq('retell_call_id', 'call_ef22574922e3fd61e8905d9a4a3')
  .single();

console.log('\n📋 Call in database:', checkData ? 'YES' : 'NO');

// Clean up
if (checkData) {
  await supabase
    .from('calls')
    .delete()
    .eq('retell_call_id', 'call_ef22574922e3fd61e8905d9a4a3');
  console.log('🧹 Cleaned up test record');
}
