-- ===========================
-- POST-CALL DATA COLLECTION
-- ===========================

-- Configuration for what data to extract from calls using Retell's post-call analysis
create table public.agent_data_collection_configs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null unique,

  -- Field definitions (what to extract)
  fields jsonb not null default '[]'::jsonb,
  -- Example: [
  --   { "id": "name", "type": "text", "label": "Customer Name", "required": true, "enabled": true },
  --   { "id": "phone", "type": "phone", "label": "Phone Number", "required": true, "enabled": true },
  --   { "id": "email", "type": "email", "label": "Email", "required": false, "enabled": true },
  --   { "id": "service_requested", "type": "text", "label": "Service Requested", "required": false, "enabled": true },
  --   { "id": "custom_field_1", "type": "text", "label": "Budget Range", "required": false, "enabled": true }
  -- ]

  -- Retell post-call analysis configuration
  -- This will be sent to Retell to configure what data to extract
  retell_analysis_config jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.agent_data_collection_configs enable row level security;

-- RLS Policies: Users can only configure their org's agents
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

-- Trigger for updated_at
create trigger update_data_collection_configs_updated_at
  before update on public.agent_data_collection_configs
  for each row
  execute function public.update_updated_at_column();

-- Index for performance
create index agent_data_collection_configs_agent_id_idx on public.agent_data_collection_configs(agent_id);
