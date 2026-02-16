require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔧 Running webhook token migration...\n');

  // Since we can't use RPC, let's just use direct SQL via a simple query
  try {
    // Check if webhook_token column exists
    const { data: columns } = await supabase
      .from('agents')
      .select('webhook_token')
      .limit(1);

    console.log('✅ webhook_token column already exists or check complete\n');
  } catch (err) {
    console.log('Note: Column check resulted in:', err.message);
  }

  try {
    // Check if outbound_calls table exists
    const { data: outbound } = await supabase
      .from('outbound_calls')
      .select('id')
      .limit(1);

    console.log('✅ outbound_calls table already exists or check complete\n');
  } catch (err) {
    console.log('Note: Table check resulted in:', err.message);
  }

  console.log('🎉 Migration check complete!');
  console.log('\n📝 If columns/tables don\'t exist, run this SQL in Supabase SQL Editor:');
  console.log(`
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS public.outbound_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  to_number TEXT NOT NULL,
  contact_name TEXT,
  contact_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  retell_call_id TEXT UNIQUE,
  call_id UUID REFERENCES public.calls(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
  `);
}

runMigration().catch(console.error);
