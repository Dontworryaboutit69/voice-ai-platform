/**
 * Fix oauth_states schema - make user_id nullable
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

async function fixSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Making user_id column nullable in oauth_states table...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE public.oauth_states ALTER COLUMN user_id DROP NOT NULL;'
  });

  if (error) {
    console.error('Error:', error.message);
    console.log('\nTrying alternative approach via Supabase Studio...');
    console.log('Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/editor');
    console.log('Run this SQL:');
    console.log('ALTER TABLE public.oauth_states ALTER COLUMN user_id DROP NOT NULL;');
  } else {
    console.log('✅ Successfully made user_id nullable!');
  }
}

fixSchema();
