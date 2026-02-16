// Run this file with: node run-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://qoendwnzpsmztgonrxzq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function runMigration() {
  console.log('🚀 Running migration...\n');

  // Just try to insert a test row to verify the table exists or will be created
  try {
    // First, let's check if the table exists by trying to select from it
    const { data: existingData, error: selectError } = await supabase
      .from('agent_data_collection_configs')
      .select('id')
      .limit(1);

    if (selectError) {
      if (selectError.code === '42P01') {
        console.log('❌ Table does not exist yet. You need to run the SQL manually in Supabase dashboard.');
        console.log('\n📋 Steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new');
        console.log('2. Copy the SQL from: MIGRATION_SQL.sql');
        console.log('3. Paste and click Run\n');
        process.exit(1);
      } else {
        throw selectError;
      }
    }

    console.log('✅ Table already exists!');
    console.log('Migration is complete. The table is ready to use.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new');
    console.log('2. Copy the SQL from: MIGRATION_SQL.sql');
    console.log('3. Paste and click Run\n');
    process.exit(1);
  }
}

runMigration();
