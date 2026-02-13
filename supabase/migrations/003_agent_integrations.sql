-- Create agent_integrations table for storing integration credentials and settings
create table if not exists public.agent_integrations (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  integration_type text not null, -- 'google-calendar', 'calendly', 'gohighlevel', 'hubspot', etc.

  -- Encrypted credentials (API keys, OAuth tokens, etc.)
  credentials jsonb not null default '{}'::jsonb,

  -- User settings for this integration
  settings jsonb not null default '{}'::jsonb,

  -- Integration status
  is_active boolean default true,
  last_synced_at timestamptz,

  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure one integration per type per agent
  unique(agent_id, integration_type)
);

-- Add RLS policies
alter table public.agent_integrations enable row level security;

-- Users can only access integrations for agents they own
create policy "Users can view their agent integrations"
  on public.agent_integrations
  for select
  using (
    exists (
      select 1 from public.agents
      where agents.id = agent_integrations.agent_id
    )
  );

create policy "Users can insert integrations for their agents"
  on public.agent_integrations
  for insert
  with check (
    exists (
      select 1 from public.agents
      where agents.id = agent_integrations.agent_id
    )
  );

create policy "Users can update their agent integrations"
  on public.agent_integrations
  for update
  using (
    exists (
      select 1 from public.agents
      where agents.id = agent_integrations.agent_id
    )
  );

create policy "Users can delete their agent integrations"
  on public.agent_integrations
  for delete
  using (
    exists (
      select 1 from public.agents
      where agents.id = agent_integrations.agent_id
    )
  );

-- Create index for faster lookups
create index if not exists idx_agent_integrations_agent_id
  on public.agent_integrations(agent_id);

create index if not exists idx_agent_integrations_type
  on public.agent_integrations(agent_id, integration_type);

-- Add updated_at trigger
create or replace function update_agent_integrations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_agent_integrations_updated_at
  before update on public.agent_integrations
  for each row
  execute function update_agent_integrations_updated_at();
