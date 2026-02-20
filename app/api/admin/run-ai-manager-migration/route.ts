import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[Migration] Starting AI Manager v2 migration...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    // Use Supabase REST API to run SQL directly
    const sqlEndpoint = `${supabaseUrl}/rest/v1/rpc/`;

    // Helper to run SQL via the Supabase management API (pg_net or direct SQL)
    async function runSQL(sql: string): Promise<{ success: boolean; error?: string }> {
      // Use the Supabase SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({}),
      });

      // This won't work directly. Let's try a different approach.
      return { success: false, error: 'SQL endpoint not available' };
    }

    // Instead, let's try to insert a test row to see if the table exists,
    // and create it if it doesn't using the Supabase management API
    const headers = {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
      'Content-Type': 'application/json',
    };

    // Check if ai_batch_analyses table exists by trying to query it
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/ai_batch_analyses?select=id&limit=0`,
      { method: 'GET', headers }
    );

    if (checkResponse.ok) {
      console.log('[Migration] ai_batch_analyses table already exists');
      return NextResponse.json({
        success: true,
        message: 'AI Manager v2 tables already exist',
        tables: ['ai_batch_analyses (exists)']
      });
    }

    // Table doesn't exist - need to create it via Supabase dashboard SQL editor
    // Return instructions for manual creation
    const createSQL = `
-- Run this in the Supabase SQL Editor:

-- 1. Create ai_batch_analyses table
CREATE TABLE IF NOT EXISTS public.ai_batch_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  call_ids UUID[] NOT NULL,
  calls_analyzed INTEGER NOT NULL,
  calls_skipped INTEGER NOT NULL DEFAULT 0,
  overall_quality_score REAL,
  strengths JSONB DEFAULT '[]'::jsonb,
  top_issues JSONB DEFAULT '[]'::jsonb,
  calls_summary JSONB,
  prompt_version_id UUID REFERENCES public.prompt_versions(id),
  suggestion_id UUID REFERENCES public.ai_improvement_suggestions(id),
  analysis_model TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_batch_analyses_agent_id ON public.ai_batch_analyses(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_batch_analyses_created_at ON public.ai_batch_analyses(created_at DESC);

-- 3. Update source_type constraint to allow 'batch_analysis'
ALTER TABLE public.ai_improvement_suggestions
  DROP CONSTRAINT IF EXISTS ai_improvement_suggestions_source_type_check;
ALTER TABLE public.ai_improvement_suggestions
  ADD CONSTRAINT ai_improvement_suggestions_source_type_check
  CHECK (source_type IN ('pattern_analysis', 'batch_evaluation', 'batch_analysis'));

-- 4. Enable RLS (match existing pattern)
ALTER TABLE public.ai_batch_analyses ENABLE ROW LEVEL SECURITY;

-- 5. Allow service role full access (same as other AI tables)
CREATE POLICY "Service role has full access to ai_batch_analyses"
  ON public.ai_batch_analyses
  FOR ALL
  USING (true)
  WITH CHECK (true);
    `.trim();

    return NextResponse.json({
      success: false,
      message: 'Table ai_batch_analyses does not exist. Run the SQL below in the Supabase SQL Editor.',
      sql: createSQL,
    }, { status: 400 });

  } catch (error) {
    console.error('[Migration] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}
