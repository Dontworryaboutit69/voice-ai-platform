-- ===========================
-- POST-CALL DATA COLLECTION
-- Run this in Supabase SQL Editor
-- ===========================

-- Create table
create table if not exists public.agent_data_collection_configs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null unique,
  fields jsonb not null default '[]'::jsonb,
  retell_analysis_config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.agent_data_collection_configs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view data collection configs" on public.agent_data_collection_configs;
drop policy if exists "Users can insert data collection configs" on public.agent_data_collection_configs;
drop policy if exists "Users can update data collection configs" on public.agent_data_collection_configs;

-- Create RLS policies
create policy "Users can view data collection configs"
  on public.agent_data_collection_configs for select
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = agent_data_collection_configs.agent_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can insert data collection configs"
  on public.agent_data_collection_configs for insert
  with check (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = agent_data_collection_configs.agent_id
      and om.user_id = auth.uid()
    )
  );

create policy "Users can update data collection configs"
  on public.agent_data_collection_configs for update
  using (
    exists (
      select 1 from public.agents a
      join public.organization_members om on om.organization_id = a.organization_id
      where a.id = agent_data_collection_configs.agent_id
      and om.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
drop trigger if exists update_data_collection_configs_updated_at on public.agent_data_collection_configs;

create trigger update_data_collection_configs_updated_at
  before update on public.agent_data_collection_configs
  for each row
  execute function public.update_updated_at_column();

-- Create index
drop index if exists agent_data_collection_configs_agent_id_idx;

create index agent_data_collection_configs_agent_id_idx
  on public.agent_data_collection_configs(agent_id);
