// Batch evaluate all calls for testing AI Manager
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function batchEvaluate() {
  console.log('🔍 Fetching all calls...\n');

  // Get all calls
  const { data: calls, error } = await supabase
    .from('calls')
    .select('id, duration_ms')
    .not('transcript', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching calls:', error);
    return;
  }

  console.log(`Found ${calls.length} calls to evaluate\n`);

  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    console.log(`[${i + 1}/${calls.length}] Evaluating call ${call.id} (${(call.duration_ms / 1000).toFixed(1)}s)...`);

    try {
      const response = await fetch(`http://localhost:3000/api/test-evaluate-call?callId=${call.id}`);
      const result = await response.json();

      if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else if (result.message === 'Call was filtered out (non-interactive)') {
        console.log(`  ⊘ Filtered out (non-interactive)`);
      } else {
        console.log(`  ✅ Evaluated - Quality: ${result.evaluation.quality_score}`);
      }
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Batch evaluation complete!\n');

  // Now show evaluation stats
  const { data: evaluations } = await supabase
    .from('ai_call_evaluations')
    .select('quality_score, empathy_score, issues_detected')
    .order('created_at', { ascending: false });

  console.log(`\n📊 Total evaluations in database: ${evaluations?.length || 0}`);
  if (evaluations && evaluations.length > 0) {
    const avgQuality = evaluations.reduce((sum, e) => sum + (e.quality_score || 0), 0) / evaluations.length;
    console.log(`Average quality score: ${avgQuality.toFixed(2)}`);

    // Count issues
    const allIssues = evaluations.flatMap(e => e.issues_detected || []);
    const issueTypes = {};
    allIssues.forEach(issue => {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
    });

    console.log('\nIssues detected:');
    Object.entries(issueTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} times`);
    });
  }
}

batchEvaluate();
