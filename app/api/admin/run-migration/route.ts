import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/run-migration
 * Runs pending database migrations using Supabase Management API.
 * Uses the SUPABASE_SERVICE_ROLE_KEY for authentication.
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check what migration to run
    const { searchParams } = new URL(request.url);
    const migration = searchParams.get('migration') || 'transfer_columns';

    if (migration === 'transfer_columns') {
      // Check if columns already exist
      const { error: checkError } = await supabase
        .from('agents')
        .select('transfer_enabled')
        .limit(1);

      if (!checkError) {
        return NextResponse.json({
          success: true,
          message: 'Transfer columns already exist'
        });
      }

      if (checkError.code !== '42703') {
        return NextResponse.json({
          success: false,
          error: 'Unexpected error checking columns',
          details: checkError
        }, { status: 500 });
      }

      // Columns don't exist — need to add them
      // Since we can't run DDL through PostgREST, we need the exec RPC function.
      // First, try to create it if it doesn't exist.
      // The service_role JWT has superuser-like access through PostgREST.

      // Try calling exec directly first (in case it was created before)
      const { error: execError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE public.agents
          ADD COLUMN IF NOT EXISTS transfer_enabled boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS transfer_number text,
          ADD COLUMN IF NOT EXISTS transfer_person_name text,
          ADD COLUMN IF NOT EXISTS transfer_triggers text[] DEFAULT '{}';`
      });

      if (!execError) {
        // Verify
        const { error: verifyError } = await supabase
          .from('agents')
          .select('transfer_enabled')
          .limit(1);

        return NextResponse.json({
          success: !verifyError,
          message: verifyError ? 'exec ran but columns not found' : 'Migration successful! Transfer columns added.',
          verifyError
        });
      }

      // exec function doesn't exist — return manual instructions
      return NextResponse.json({
        success: false,
        message: 'Cannot run DDL automatically. The exec() function does not exist in the database.',
        manualSQL: `ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS transfer_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS transfer_number text,
  ADD COLUMN IF NOT EXISTS transfer_person_name text,
  ADD COLUMN IF NOT EXISTS transfer_triggers text[] DEFAULT '{}';`,
        execError: execError.message,
        hint: 'Run this SQL in Supabase Dashboard → SQL Editor'
      });
    }

    return NextResponse.json({ error: 'Unknown migration: ' + migration }, { status: 400 });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to run migration', details: error.message },
      { status: 500 }
    );
  }
}
