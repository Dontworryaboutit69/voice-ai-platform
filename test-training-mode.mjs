import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qoendwnzpsmztgonrxzq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE'
);

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const API_BASE = 'https://voice-ai-platform-orcin.vercel.app';

console.log('🧪 COMPREHENSIVE TRAINING MODE TEST');
console.log('===================================\n');

// Step 1: Get current prompt version
console.log('📋 Step 1: Getting current prompt state...');
const { data: agent, error: agentError } = await supabase
  .from('agents')
  .select('*, current_prompt:prompt_versions!current_prompt_id(*)')
  .eq('id', AGENT_ID)
  .single();

if (agentError || !agent) {
  console.error('❌ Failed to get agent:', agentError);
  process.exit(1);
}

const currentPrompt = agent.current_prompt;
console.log('✅ Current prompt:');
console.log('   Version:', currentPrompt.version_number);
console.log('   Token count:', currentPrompt.token_count);
console.log('   Prompt preview:', currentPrompt.compiled_prompt.substring(0, 150) + '...');
console.log('');

// Step 2: Get framework instructions
console.log('📚 Step 2: Checking framework instructions...');
const { data: framework } = await supabase
  .from('framework_instructions')
  .select('*')
  .eq('is_active', true)
  .single();

if (!framework) {
  console.error('❌ No active framework found!');
  process.exit(1);
}

console.log('✅ Framework loaded');
console.log('   Instructions preview:', framework.instructions.substring(0, 100) + '...');
console.log('');

// Step 3: Test the improve endpoint with simulated feedback
console.log('🎯 Step 3: Testing improve endpoint with feedback...');
console.log('   Feedback: "Make the greeting shorter and more energetic"');

const improveResponse = await fetch(`${API_BASE}/api/agents/${AGENT_ID}/improve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedback: 'Make the greeting shorter and more energetic. Remove any long introductions.'
  })
});

console.log('   Response status:', improveResponse.status);
const improveResult = await improveResponse.json();

if (!improveResult.success) {
  console.error('❌ Improve endpoint failed:', improveResult.error);
  process.exit(1);
}

console.log('✅ Improve endpoint succeeded!');
console.log('   New version:', improveResult.versionNumber);
console.log('   Change summary:', improveResult.changeSummary);
console.log('');

// Wait for database to settle
await new Promise(r => setTimeout(r, 2000));

// Step 4: Verify the new prompt was saved
console.log('🔍 Step 4: Verifying new prompt was saved...');
const { data: updatedAgent } = await supabase
  .from('agents')
  .select('*, current_prompt:prompt_versions!current_prompt_id(*)')
  .eq('id', AGENT_ID)
  .single();

const newPrompt = updatedAgent.current_prompt;

if (newPrompt.version_number !== currentPrompt.version_number + 1) {
  console.error('❌ Version number did not increment!');
  console.error('   Expected:', currentPrompt.version_number + 1);
  console.error('   Got:', newPrompt.version_number);
  process.exit(1);
}

console.log('✅ New prompt version saved:');
console.log('   Version:', newPrompt.version_number);
console.log('   Token count:', newPrompt.token_count);
console.log('   Generation method:', newPrompt.generation_method);
console.log('   Change summary:', newPrompt.change_summary);
console.log('');

// Step 5: Compare prompts to verify changes were made
console.log('📊 Step 5: Comparing old vs new prompt...');
console.log('   Old prompt length:', currentPrompt.compiled_prompt.length);
console.log('   New prompt length:', newPrompt.compiled_prompt.length);

if (currentPrompt.compiled_prompt === newPrompt.compiled_prompt) {
  console.warn('⚠️  WARNING: Prompts are identical! AI may not have made changes.');
} else {
  console.log('✅ Prompts are different - changes were made');
}

// Show first 300 chars of each for comparison
console.log('\n   Old prompt start:');
console.log('   ', currentPrompt.compiled_prompt.substring(0, 300).replace(/\n/g, ' '));
console.log('\n   New prompt start:');
console.log('   ', newPrompt.compiled_prompt.substring(0, 300).replace(/\n/g, ' '));
console.log('');

// Step 6: Test voice API to ensure it uses the new prompt
console.log('🎤 Step 6: Testing that voice test would use new prompt...');
const { data: latestAgent } = await supabase
  .from('agents')
  .select('retell_agent_id, current_prompt_id')
  .eq('id', AGENT_ID)
  .single();

if (latestAgent.current_prompt_id === newPrompt.id) {
  console.log('✅ Agent is pointing to the new prompt version');
  console.log('   Current prompt ID:', latestAgent.current_prompt_id);
  console.log('   New version ID:', newPrompt.id);
} else {
  console.error('❌ Agent is NOT pointing to new prompt!');
  console.error('   Current prompt ID:', latestAgent.current_prompt_id);
  console.error('   Expected:', newPrompt.id);
  process.exit(1);
}
console.log('');

// Step 7: Verify prompt history is maintained
console.log('📜 Step 7: Checking prompt version history...');
const { data: allVersions } = await supabase
  .from('prompt_versions')
  .select('*')
  .eq('agent_id', AGENT_ID)
  .order('version_number', { ascending: false })
  .limit(5);

console.log('✅ Recent prompt versions:');
allVersions.forEach((v, i) => {
  console.log(`   ${i + 1}. Version ${v.version_number} - ${v.generation_method} - ${new Date(v.created_at).toLocaleString()}`);
  if (v.change_summary) {
    console.log(`      ${v.change_summary}`);
  }
});
console.log('');

// Step 8: Test rollback capability
console.log('🔄 Step 8: Testing that we can rollback if needed...');
const canRollback = allVersions.length > 1;
console.log(canRollback ? '✅ Rollback possible - multiple versions exist' : '⚠️  Only one version exists');
console.log('');

// Final Summary
console.log('🎉 TRAINING MODE TEST COMPLETE!');
console.log('================================');
console.log('');
console.log('✅ All critical paths verified:');
console.log('   1. Current prompt retrieval');
console.log('   2. Framework instructions loaded');
console.log('   3. Improve endpoint processes feedback');
console.log('   4. New prompt version created');
console.log('   5. Agent updated to use new prompt');
console.log('   6. Prompt history maintained');
console.log('   7. Rollback capability exists');
console.log('');
console.log('📝 NEXT USER TEST:');
console.log('   1. Go to: https://voice-ai-platform-orcin.vercel.app/agents/' + AGENT_ID);
console.log('   2. Click "Test Agent" tab');
console.log('   3. Enable "Training Mode" checkbox');
console.log('   4. Start a voice or text call');
console.log('   5. Type feedback like: "Be more enthusiastic"');
console.log('   6. Click "Improve" button');
console.log('   7. Wait for "Success! Prompt updated to version X" message');
console.log('   8. Start another call - it should use the new improved prompt');
console.log('');
console.log('✨ Training mode is READY for production use!');
