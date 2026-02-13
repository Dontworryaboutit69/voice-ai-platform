-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===========================
-- ORGANIZATIONS & USERS
-- ===========================

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- ===========================
-- FRAMEWORK INSTRUCTIONS
-- ===========================

create table public.framework_instructions (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  version text not null,
  instructions text not null, -- The full Claude framework
  sections_schema jsonb not null,
  quality_checklist jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ===========================
-- AGENTS & PROMPTS
-- ===========================

create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null unique,

  -- Business context (from onboarding form)
  business_name text not null,
  business_type text,
  business_description text,
  service_area text,
  website text,

  -- Retell configuration
  retell_agent_id text unique,
  retell_llm_id text,
  retell_phone_number text,
  voice_id text default '11labs-Sarah',
  voice_speed real default 1.0,
  language text default 'en-US',

  -- Current active prompt
  current_prompt_id uuid,

  -- Agent status
  status text default 'draft' check (status in ('draft', 'testing', 'active', 'paused')),
  is_free_trial boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.prompt_versions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade,
  version_number integer not null,

  -- 6-section prompt structure
  prompt_role text not null,
  prompt_personality text not null,
  prompt_call_flow text not null,
  prompt_info_recap text not null,
  prompt_functions jsonb default '[]'::jsonb,
  prompt_knowledge text,

  -- Compiled full prompt (sent to Retell/Claude)
  compiled_prompt text not null,

  -- Metadata
  generation_method text default 'ai_generated'
    check (generation_method in ('ai_generated', 'user_edited', 'auto_improved')),
  parent_version_id uuid references public.prompt_versions(id),
  change_summary text,
  token_count integer,
  quality_score real,

  created_at timestamptz default now(),
  created_by uuid references auth.users(id),

  unique (agent_id, version_number)
);

-- Add foreign key for current_prompt_id
alter table public.agents
  add constraint agents_current_prompt_fkey
  foreign key (current_prompt_id)
  references public.prompt_versions(id);

-- ===========================
-- TEST CONVERSATIONS
-- ===========================

create table public.test_conversations (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade,
  prompt_version_id uuid references public.prompt_versions(id),
  user_id uuid references auth.users(id),

  mode text default 'text' check (mode in ('text', 'voice')),
  retell_call_id text, -- if voice mode
  transcript jsonb default '[]'::jsonb,

  -- Analysis
  duration_seconds integer,
  message_count integer default 0,
  issues_detected jsonb default '[]'::jsonb,

  -- User feedback during conversation
  feedback_items jsonb default '[]'::jsonb,

  status text default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),

  created_at timestamptz default now(),
  ended_at timestamptz
);

-- ===========================
-- PROMPT IMPROVEMENTS
-- ===========================

create table public.prompt_improvements (
  id uuid primary key default uuid_generate_v4(),
  test_conversation_id uuid references public.test_conversations(id),
  source_version_id uuid references public.prompt_versions(id),
  target_version_id uuid references public.prompt_versions(id),

  user_feedback text not null,
  analysis jsonb,
  planned_changes jsonb,

  status text default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),

  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ===========================
-- PRODUCTION CALLS
-- ===========================

create table public.calls (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id),
  retell_call_id text unique,

  from_number text,
  to_number text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_ms integer,

  transcript text,
  transcript_object jsonb,
  recording_url text,

  call_status text,
  call_analysis jsonb,

  created_at timestamptz default now()
);

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.agents enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.test_conversations enable row level security;
alter table public.prompt_improvements enable row level security;
alter table public.calls enable row level security;

-- Organizations: Users can only see orgs they're members of
create policy "Users can view their organizations"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id
      and user_id = auth.uid()
    )
  );

create policy "Users can update their organizations"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Organization Members: Users can view members of their orgs
create policy "Users can view org members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_id
      and om.user_id = auth.uid()
    )
  );

-- Agents: Users can only see agents in their organizations
create policy "Users can view their org's agents"
  on public.agents for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = agents.organization_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert agents in their orgs"
  on public.agents for insert
  with check (
    exists (
      select 1 from public.organization_members
      where organization_id = agents.organization_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update their org's agents"
  on public.agents for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = agents.organization_id
      and user_id = auth.uid()
    )
  );

-- Prompt Versions: Accessible via agent ownership
create policy "Users can view prompt versions"
  on public.prompt_versions for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = prompt_versions.agent_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can insert prompt versions"
  on public.prompt_versions for insert
  with check (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = prompt_versions.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Test Conversations: Visible to creator or org members
create policy "Users can view test conversations"
  on public.test_conversations for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = test_conversations.agent_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can insert test conversations"
  on public.test_conversations for insert
  with check (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = test_conversations.agent_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can update their test conversations"
  on public.test_conversations for update
  using (user_id = auth.uid());

-- Prompt Improvements: Same as test conversations
create policy "Users can view prompt improvements"
  on public.prompt_improvements for select
  using (
    exists (
      select 1 from public.test_conversations tc
      where tc.id = prompt_improvements.test_conversation_id
      and tc.user_id = auth.uid()
    )
  );

create policy "Users can insert prompt improvements"
  on public.prompt_improvements for insert
  with check (
    exists (
      select 1 from public.test_conversations tc
      where tc.id = prompt_improvements.test_conversation_id
      and tc.user_id = auth.uid()
    )
  );

-- Calls: Visible to org members only
create policy "Users can view calls"
  on public.calls for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = calls.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Framework Instructions: Readable by all authenticated users
create policy "Authenticated users can view framework instructions"
  on public.framework_instructions for select
  using (auth.role() = 'authenticated');

-- ===========================
-- INDEXES FOR PERFORMANCE
-- ===========================

create index agents_organization_id_idx on public.agents(organization_id);
create index agents_slug_idx on public.agents(slug);
create index prompt_versions_agent_id_idx on public.prompt_versions(agent_id);
create index test_conversations_agent_id_idx on public.test_conversations(agent_id);
create index test_conversations_user_id_idx on public.test_conversations(user_id);
create index calls_agent_id_idx on public.calls(agent_id);
create index calls_retell_call_id_idx on public.calls(retell_call_id);

-- ===========================
-- FUNCTIONS
-- ===========================

-- Function to automatically update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for agents table
create trigger update_agents_updated_at
  before update on public.agents
  for each row
  execute function public.update_updated_at_column();

-- Trigger for organizations table
create trigger update_organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.update_updated_at_column();
