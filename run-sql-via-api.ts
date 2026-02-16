/**
 * Run SQL via Supabase Management API
 * This bypasses the need for RPC functions
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PROJECT_REF = 'qoendwnzpsmztgonrxzq'; // Extracted from URL

async function runSQL(sql: string) {
  console.log('🔧 Running SQL via Supabase API...\n');
  console.log('SQL:', sql);
  console.log('');

  // Try using the postgres REST API directly
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data.substring(0, 500));

    if (response.ok) {
      console.log('\n✅ SQL executed successfully!\n');
      return true;
    } else {
      console.log('\n❌ SQL execution failed\n');
      return false;
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('📋 Applying webhook_token migration...\n');

  const sql = `
    ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_agents_webhook_token ON public.agents(webhook_token);
  `;

  const success = await runSQL(sql);

  if (!success) {
    console.log('⚠️  Could not apply migration via API');
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new');
    console.log('\n');
    console.log(sql);
    console.log('\n');
  }
}

main().catch(console.error);
