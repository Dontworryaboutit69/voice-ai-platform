/**
 * Apply webhook_token migration directly to database
 * Run with: npx tsx apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('🔧 Applying webhook_token migration...\n');

  try {
    // Check if column already exists
    const { data: testData, error: testError } = await supabase
      .from('agents')
      .select('webhook_token')
      .limit(1);

    if (!testError) {
      console.log('✅ webhook_token column already exists!');
      console.log('   No migration needed.\n');
      return;
    }

    if (!testError?.message.includes('webhook_token')) {
      console.log('❌ Unexpected error:', testError?.message);
      return;
    }

    console.log('📝 Column does not exist. Adding webhook_token column...');

    // Use raw SQL to add the column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;'
    });

    if (alterError) {
      console.log('❌ Failed to add column via RPC. Trying alternative method...');
      console.log('   Error:', alterError.message);
      console.log('\n📋 Manual Steps Required:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/editor');
      console.log('   2. Click "SQL Editor"');
      console.log('   3. Run this SQL:');
      console.log('      ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;');
      console.log('      CREATE INDEX IF NOT EXISTS idx_agents_webhook_token ON public.agents(webhook_token);');
      return;
    }

    console.log('✅ Column added successfully!');

    // Add index
    console.log('📝 Adding index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_agents_webhook_token ON public.agents(webhook_token);'
    });

    if (indexError) {
      console.log('⚠️  Index creation failed (not critical)');
    } else {
      console.log('✅ Index created!');
    }

    console.log('\n✅ Migration complete!\n');

  } catch (error: any) {
    console.log('❌ Error during migration:', error.message);
    console.log('\n📋 Please apply migration manually in Supabase Dashboard');
  }
}

async function listAgents() {
  console.log('👤 Fetching agents...\n');

  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name')
      .limit(10);

    if (error) {
      console.log('❌ Error fetching agents:', error.message);
      return;
    }

    if (!agents || agents.length === 0) {
      console.log('ℹ️  No agents found in database');
      console.log('   Create an agent first before testing integration\n');
      return;
    }

    console.log(`Found ${agents.length} agent(s):\n`);
    agents.forEach((agent, idx) => {
      console.log(`${idx + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   URL: http://localhost:3000/agents/${agent.id}\n`);
    });

  } catch (error: any) {
    console.log('❌ Error listing agents:', error.message);
  }
}

async function main() {
  await applyMigration();
  await listAgents();
}

main().catch(console.error);
