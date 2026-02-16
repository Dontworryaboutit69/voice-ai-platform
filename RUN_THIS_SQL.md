# Run This SQL in Supabase Dashboard

## Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new

## Step 2: Copy and Paste This SQL:

```sql
-- Create AI Manager tables
CREATE TABLE IF NOT EXISTS public.ai_call_evaluations (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references public.calls(id) on delete cascade not null unique,
  agent_id uuid references public.agents(id) not null,
  quality_score real,
  empathy_score real,
  professionalism_score real,
  efficiency_score real,
  goal_achievement_score real,
  issues_detected jsonb default '[]'::jsonb,
  opportunities jsonb default '[]'::jsonb,
  summary_analysis text,
  analysis_model text default 'claude-3-5-sonnet-20241022',
  analysis_timestamp timestamptz default now(),
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.ai_improvement_suggestions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  source_type text not null,
  source_call_ids uuid[] not null,
  suggestion_type text not null default 'prompt_change',
  title text not null,
  description text not null,
  proposed_changes jsonb not null,
  confidence_score real,
  impact_estimate text,
  status text default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid,
  applied_to_version_id uuid,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.ai_pattern_analysis (
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
```

## Step 3: Click "Run" button

## Step 4: Come back here and I'll restart the server and test!
