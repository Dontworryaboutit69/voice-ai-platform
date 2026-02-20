import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST() {
  try {
    const supabase = createServiceClient();

    console.log('[Migration] Starting AI Manager v2 migration...');

    // Create ai_call_evaluations table (legacy, kept for backward compat)
    const { error: evalTableError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.ai_call_evaluations (
          id uuid primary key default uuid_generate_v4(),
          call_id uuid references public.calls(id) on delete cascade not null unique,
          agent_id uuid references public.agents(id) not null,
          quality_score real check (quality_score >= 0 and quality_score <= 1),
          empathy_score real check (empathy_score >= 0 and empathy_score <= 1),
          professionalism_score real check (professionalism_score >= 0 and professionalism_score <= 1),
          efficiency_score real check (efficiency_score >= 0 and efficiency_score <= 1),
          goal_achievement_score real check (goal_achievement_score >= 0 and goal_achievement_score <= 1),
          issues_detected jsonb default '[]'::jsonb,
          opportunities jsonb default '[]'::jsonb,
          summary_analysis text,
          analysis_model text default 'claude-3-5-sonnet-20241022',
          analysis_timestamp timestamptz default now(),
          created_at timestamptz default now()
        );
      `
    });

    if (evalTableError) {
      console.error('[Migration] Error creating ai_call_evaluations:', evalTableError);
      return NextResponse.json({ error: 'Failed to create ai_call_evaluations table', details: evalTableError }, { status: 500 });
    }

    console.log('[Migration] Created ai_call_evaluations table');

    // Create ai_improvement_suggestions table
    const { error: sugTableError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.ai_improvement_suggestions (
          id uuid primary key default uuid_generate_v4(),
          agent_id uuid references public.agents(id) on delete cascade not null,
          source_type text not null check (source_type in ('pattern_analysis', 'batch_evaluation', 'batch_analysis')),
          source_call_ids uuid[] not null,
          suggestion_type text not null default 'prompt_change',
          title text not null,
          description text not null,
          proposed_changes jsonb not null,
          confidence_score real check (confidence_score >= 0 and confidence_score <= 1),
          impact_estimate text check (impact_estimate in ('low', 'medium', 'high')),
          status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
          reviewed_at timestamptz,
          reviewed_by uuid references auth.users(id),
          applied_to_version_id uuid references public.prompt_versions(id),
          created_at timestamptz default now()
        );
      `
    });

    if (sugTableError) {
      console.error('[Migration] Error creating ai_improvement_suggestions:', sugTableError);
      return NextResponse.json({ error: 'Failed to create ai_improvement_suggestions table', details: sugTableError }, { status: 500 });
    }

    console.log('[Migration] Created ai_improvement_suggestions table');

    // Create ai_pattern_analysis table (legacy, kept for backward compat)
    const { error: patTableError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.ai_pattern_analysis (
          id uuid primary key default uuid_generate_v4(),
          agent_id uuid references public.agents(id) on delete cascade not null,
          analysis_period_start timestamptz not null,
          analysis_period_end timestamptz not null,
          total_calls_analyzed integer not null,
          patterns jsonb not null,
          avg_quality_score real,
          avg_call_duration_seconds integer,
          recommendations jsonb,
          created_at timestamptz default now()
        );
      `
    });

    if (patTableError) {
      console.error('[Migration] Error creating ai_pattern_analysis:', patTableError);
      return NextResponse.json({ error: 'Failed to create ai_pattern_analysis table', details: patTableError }, { status: 500 });
    }

    console.log('[Migration] Created ai_pattern_analysis table');

    // NEW: Create ai_batch_analyses table for v2
    const { error: batchTableError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists public.ai_batch_analyses (
          id uuid primary key default uuid_generate_v4(),
          agent_id uuid references public.agents(id) on delete cascade not null,
          call_ids uuid[] not null,
          calls_analyzed integer not null,
          calls_skipped integer not null default 0,
          overall_quality_score real,
          strengths jsonb default '[]'::jsonb,
          top_issues jsonb default '[]'::jsonb,
          calls_summary jsonb,
          prompt_version_id uuid references public.prompt_versions(id),
          suggestion_id uuid references public.ai_improvement_suggestions(id),
          analysis_model text default 'claude-sonnet-4-5-20250929',
          created_at timestamptz default now()
        );
      `
    });

    if (batchTableError) {
      console.error('[Migration] Error creating ai_batch_analyses:', batchTableError);
      return NextResponse.json({ error: 'Failed to create ai_batch_analyses table', details: batchTableError }, { status: 500 });
    }

    console.log('[Migration] Created ai_batch_analyses table');

    // Update source_type constraint to allow 'batch_analysis'
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          -- Drop old constraint if it exists
          ALTER TABLE public.ai_improvement_suggestions
            DROP CONSTRAINT IF EXISTS ai_improvement_suggestions_source_type_check;
          -- Add new constraint allowing batch_analysis
          ALTER TABLE public.ai_improvement_suggestions
            ADD CONSTRAINT ai_improvement_suggestions_source_type_check
            CHECK (source_type IN ('pattern_analysis', 'batch_evaluation', 'batch_analysis'));
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Constraint update skipped: %', SQLERRM;
        END $$;
      `
    });

    if (constraintError) {
      console.warn('[Migration] Constraint update warning (non-fatal):', constraintError);
    }

    // Create indexes for batch analyses
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_ai_batch_analyses_agent_id
          ON public.ai_batch_analyses(agent_id);
        CREATE INDEX IF NOT EXISTS idx_ai_batch_analyses_created_at
          ON public.ai_batch_analyses(created_at DESC);
      `
    });

    if (indexError) {
      console.warn('[Migration] Index creation warning (non-fatal):', indexError);
    }

    console.log('[Migration] All tables created successfully!');

    return NextResponse.json({
      success: true,
      message: 'AI Manager v2 migration completed successfully',
      tables: ['ai_call_evaluations', 'ai_improvement_suggestions', 'ai_pattern_analysis', 'ai_batch_analyses']
    });

  } catch (error) {
    console.error('[Migration] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
