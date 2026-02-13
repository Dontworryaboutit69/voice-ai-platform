/**
 * Check if prompt versions are being created
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVersions() {
  const { data, error } = await supabase
    .from('prompt_versions')
    .select('version_number, generation_method, change_summary, created_at')
    .eq('agent_id', 'f02fd2dc-32d7-42b8-8378-126d354798f7')
    .order('version_number', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📋 Last 5 Prompt Versions:');
  console.log('─'.repeat(80));
  data.forEach(v => {
    console.log(`\nVersion ${v.version_number} (${v.generation_method})`);
    console.log(`  Created: ${new Date(v.created_at).toLocaleString()}`);
    console.log(`  Change: ${v.change_summary || 'N/A'}`);
  });
}

checkVersions();
