/**
 * Run database migration script
 * Usage: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_integrations.sql');
  console.log(`📄 Reading migration from: ${migrationPath}`);

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🚀 Executing migration...');
  console.log('⏳ This may take a few seconds...\n');

  // Split SQL into statements and execute them one by one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let skipCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: statement + ';'
      });

      if (error) {
        // Check if error is because table/policy already exists
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate')
        ) {
          console.log(' ⏭️  (already exists)');
          skipCount++;
        } else {
          console.log(` ❌ ERROR`);
          errors.push({
            statement: preview,
            error: error.message
          });
        }
      } else {
        console.log(' ✅');
        successCount++;
      }
    } catch (err) {
      console.log(` ❌ EXCEPTION`);
      errors.push({
        statement: preview,
        error: err.message
      });
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.statement}`);
      console.log(`   Error: ${err.error}`);
    });

    // Check if errors are critical
    const criticalErrors = errors.filter(e =>
      !e.error.includes('already exists') &&
      !e.error.includes('duplicate') &&
      !e.error.includes('does not exist')
    );

    if (criticalErrors.length === 0) {
      console.log('\n✅ All errors are non-critical (objects already exist). Migration OK!');
      process.exit(0);
    } else {
      console.log('\n❌ Some critical errors occurred. Please review.');
      process.exit(1);
    }
  } else {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  }
}

runMigration().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
