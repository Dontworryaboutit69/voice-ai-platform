-- ===========================
-- AI MANAGER SYSTEM
-- Automated call analysis and improvement suggestions
-- ===========================

-- Stores AI Manager's analysis of each call
create table if not exists public.ai_call_evaluations (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references public.calls(id) on delete cascade not null unique,
  agent_id uuid references public.agents(id) not null,

  -- Overall scores (0.0 to 1.0)
  quality_score real check (quality_score >= 0 and quality_score <= 1),
  empathy_score real check (empathy_score >= 0 and empathy_score <= 1),
  professionalism_score real check (professionalism_score >= 0 and professionalism_score <= 1),
  efficiency_score real check (efficiency_score >= 0 and efficiency_score <= 1),
  goal_achievement_score real check (goal_achievement_score >= 0 and goal_achievement_score <= 1),

  -- Detected issues with examples
  issues_detected jsonb default '[]'::jsonb,
  -- Format: [
  --   { "type": "multiple_questions", "severity": "medium", "turn": 5, "example": "..." },
  --   { "type": "no_empathy", "severity": "high", "turn": 3, "example": "..." }
  -- ]

  -- Missed opportunities
  opportunities jsonb default '[]'::jsonb,
  -- Format: [
  --   { "type": "upsell_missed", "description": "Customer mentioned interest in X but agent didn't ask" }
  -- ]

  -- Summary
  summary_analysis text,

  -- Metadata
  analysis_model text default 'claude-3-5-sonnet-20241022',
  analysis_timestamp timestamptz default now(),

  created_at timestamptz default now()
);

-- Stores improvement suggestions from AI Manager
create table if not exists public.ai_improvement_suggestions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,

  -- Source
  source_type text not null check (source_type in ('pattern_analysis', 'batch_evaluation')),
  source_call_ids uuid[] not null, -- Calls that led to this suggestion

  -- The suggestion
  suggestion_type text not null default 'prompt_change',
  title text not null,
  description text not null,

  -- Proposed changes
  proposed_changes jsonb not null,
  -- Format: {
  --   "sections": ["personality", "call_flow"],
  --   "changes": [
  --     { "section": "personality", "modification": "Add empathy when customer mentions emergency" }
  --   ]
  -- }

  confidence_score real check (confidence_score >= 0 and confidence_score <= 1),
  impact_estimate text check (impact_estimate in ('low', 'medium', 'high')),

  -- User action - ALWAYS requires approval
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),

  -- If accepted, which version was created
  applied_to_version_id uuid references public.prompt_versions(id),

  created_at timestamptz default now()
);

-- Tracks pattern analysis across multiple calls
create table if not exists public.ai_pattern_analysis (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,

  analysis_period_start timestamptz not null,
  analysis_period_end timestamptz not null,
  total_calls_analyzed integer not null,

  -- Detected patterns
  patterns jsonb not null,
  -- Format: [
  --   {
  --     "pattern": "agent_asks_multiple_questions",
  --     "occurrence_count": 5,
  --     "frequency": 0.45,
  --     "severity": "medium",
  --     "example_call_ids": ["uuid1", "uuid2", "uuid3"]
  --   }
  -- ]

  -- Aggregate metrics
  avg_quality_score real,
  avg_call_duration_seconds integer,

  -- Recommendations
  recommendations jsonb,

  created_at timestamptz default now()
);

-- Enable RLS
alter table public.ai_call_evaluations enable row level security;
alter table public.ai_improvement_suggestions enable row level security;
alter table public.ai_pattern_analysis enable row level security;

-- RLS Policies: Users can only access their org's data

-- Evaluations
drop policy if exists "Users can view evaluations for their agents" on public.ai_call_evaluations;
create policy "Users can view evaluations for their agents"
  on public.ai_call_evaluations for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = ai_call_evaluations.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Suggestions
drop policy if exists "Users can view suggestions for their agents" on public.ai_improvement_suggestions;
create policy "Users can view suggestions for their agents"
  on public.ai_improvement_suggestions for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = ai_improvement_suggestions.agent_id
      and om.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update their suggestions" on public.ai_improvement_suggestions;
create policy "Users can update their suggestions"
  on public.ai_improvement_suggestions for update
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = ai_improvement_suggestions.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Pattern analysis
drop policy if exists "Users can view pattern analysis for their agents" on public.ai_pattern_analysis;
create policy "Users can view pattern analysis for their agents"
  on public.ai_pattern_analysis for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = ai_pattern_analysis.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists ai_call_evaluations_agent_id_idx on public.ai_call_evaluations(agent_id);
create index if not exists ai_call_evaluations_call_id_idx on public.ai_call_evaluations(call_id);
create index if not exists ai_call_evaluations_created_at_idx on public.ai_call_evaluations(created_at desc);

create index if not exists ai_improvement_suggestions_agent_id_idx on public.ai_improvement_suggestions(agent_id);
create index if not exists ai_improvement_suggestions_status_idx on public.ai_improvement_suggestions(status);
create index if not exists ai_improvement_suggestions_created_at_idx on public.ai_improvement_suggestions(created_at desc);

create index if not exists ai_pattern_analysis_agent_id_idx on public.ai_pattern_analysis(agent_id);
create index if not exists ai_pattern_analysis_created_at_idx on public.ai_pattern_analysis(created_at desc);
