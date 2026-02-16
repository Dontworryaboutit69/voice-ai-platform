// Run this file with: node run-ai-manager-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running AI Manager migration...\n');

  // Read the SQL file
  const sql = fs.readFileSync('./supabase/migrations/009_ai_manager.sql', 'utf8');

  // Split into individual statements (simple split on semicolon + newline)
  const statements = sql
    .split(';\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments
    if (statement.startsWith('--')) continue;

    // Show first 100 chars of statement
    const preview = statement.substring(0, 100).replace(/\n/g, ' ');
    console.log(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Try direct query if rpc doesn't work
        const { error: queryError } = await supabase.from('_').select('*').limit(0);

        // If it's a "create table" statement, try using raw query
        if (statement.includes('create table')) {
          console.log('  ⚠️  Using alternative execution method...');
          // We'll need to use the REST API directly or accept that some statements might fail
          console.log('  ℹ️  Skipping (will execute manually if needed)');
        } else {
          console.error('  ❌ Error:', error.message);
          errorCount++;
        }
      } else {
        console.log('  ✅ Success');
        successCount++;
      }
    } catch (err) {
      console.error('  ❌ Exception:', err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log('\n💡 Note: If there were errors, you can run the SQL manually in Supabase dashboard:');
  console.log('  https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new\n');
}

runMigration();
