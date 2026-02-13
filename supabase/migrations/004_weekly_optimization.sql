-- Weekly optimization system for self-improving agents

-- Agent optimizations table
create table if not exists public.agent_optimizations (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade,

  -- Analysis period
  analysis_period_start timestamptz not null,
  analysis_period_end timestamptz not null,
  calls_analyzed integer not null default 0,

  -- Performance metrics
  avg_sentiment real,
  conversion_rate real,
  avg_call_duration_seconds integer,
  total_calls_successful integer,
  total_calls_failed integer,

  -- Analysis results
  common_issues jsonb default '[]', -- [{issue, description, frequency, impactScore, examples}]
  success_patterns jsonb default '[]', -- [{pattern, description, frequency}]
  urgency_handling_score real,
  question_efficiency_score real,

  -- Proposed improvements
  proposed_prompt_changes text,
  proposed_prompt_version_id uuid references public.prompt_versions(id),
  change_summary text,
  expected_improvements jsonb default '[]', -- [{metric, currentValue, expectedValue}]

  -- User interaction
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'ab_testing', 'completed', 'skipped')),
  user_feedback text,

  -- A/B test tracking
  ab_test_started_at timestamptz,
  ab_test_ended_at timestamptz,
  ab_test_control_version_id uuid references public.prompt_versions(id),
  ab_test_results jsonb,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  applied_at timestamptz,

  -- Ensure one optimization per week per agent
  unique(agent_id, analysis_period_start)
);

-- A/B testing configuration
create table if not exists public.ab_tests (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade,
  optimization_id uuid references public.agent_optimizations(id) on delete cascade,

  -- Test configuration
  control_version_id uuid references public.prompt_versions(id),
  test_version_id uuid references public.prompt_versions(id),
  traffic_split_control integer default 75 check (traffic_split_control >= 0 and traffic_split_control <= 100),
  traffic_split_test integer default 25 check (traffic_split_test >= 0 and traffic_split_test <= 100),

  -- Test duration
  started_at timestamptz default now(),
  scheduled_end_at timestamptz,
  ended_at timestamptz,

  -- Results
  control_calls integer default 0,
  test_calls integer default 0,
  control_avg_sentiment real,
  test_avg_sentiment real,
  control_conversion_rate real,
  test_conversion_rate real,
  control_avg_duration_seconds integer,
  test_avg_duration_seconds integer,

  -- Decision
  winner text check (winner in ('control', 'test', 'inconclusive')),
  promoted_version_id uuid references public.prompt_versions(id),

  status text default 'running' check (status in ('running', 'completed', 'cancelled')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Track which version each call used (for A/B testing)
alter table public.calls
  add column if not exists prompt_version_id uuid references public.prompt_versions(id),
  add column if not exists ab_test_id uuid references public.ab_tests(id),
  add column if not exists sentiment_score real,
  add column if not exists conversion_successful boolean;

-- Indexes
create index if not exists idx_agent_optimizations_agent on public.agent_optimizations(agent_id);
create index if not exists idx_agent_optimizations_status on public.agent_optimizations(status);
create index if not exists idx_agent_optimizations_period on public.agent_optimizations(analysis_period_start, analysis_period_end);

create index if not exists idx_ab_tests_agent on public.ab_tests(agent_id);
create index if not exists idx_ab_tests_status on public.ab_tests(status);
create index if not exists idx_ab_tests_optimization on public.ab_tests(optimization_id);

create index if not exists idx_calls_version on public.calls(prompt_version_id);
create index if not exists idx_calls_ab_test on public.calls(ab_test_id);

-- RLS Policies
alter table public.agent_optimizations enable row level security;

create policy "Users can view their organization's optimizations"
  on public.agent_optimizations for select
  using (
    agent_id in (
      select id from public.agents where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );

create policy "Users can update their organization's optimizations"
  on public.agent_optimizations for update
  using (
    agent_id in (
      select id from public.agents where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );

create policy "System can insert optimizations"
  on public.agent_optimizations for insert
  with check (true);

alter table public.ab_tests enable row level security;

create policy "Users can view their organization's AB tests"
  on public.ab_tests for select
  using (
    agent_id in (
      select id from public.agents where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );

create policy "System can manage AB tests"
  on public.ab_tests for all
  using (true);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger update_agent_optimizations_updated_at before update on public.agent_optimizations
  for each row execute function update_updated_at_column();

create trigger update_ab_tests_updated_at before update on public.ab_tests
  for each row execute function update_updated_at_column();
