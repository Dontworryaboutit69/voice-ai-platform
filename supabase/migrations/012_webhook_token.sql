-- Add webhook token column to agents table for CRM webhook integration
alter table public.agents add column if not exists webhook_token text unique;

-- Add index for faster webhook token lookups
create index if not exists idx_agents_webhook_token on public.agents(webhook_token);

-- Create outbound_calls table if it doesn't exist
create table if not exists public.outbound_calls (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  
  to_number text not null,
  contact_name text,
  contact_data jsonb default '{}'::jsonb,
  
  status text default 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  retell_call_id text unique,
  call_id uuid references public.calls(id), -- Link to actual call once connected
  
  notes text,
  
  created_at timestamptz default now()
);

-- Add RLS policies for outbound_calls
alter table public.outbound_calls enable row level security;

create policy "Users can view outbound calls for their organization's agents"
  on public.outbound_calls for select
  using (
    exists (
      select 1 from public.agents
      where agents.id = outbound_calls.agent_id
      and agents.organization_id in (
        select organization_id from public.user_organizations
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert outbound calls for their organization's agents"
  on public.outbound_calls for insert
  with check (
    exists (
      select 1 from public.agents
      where agents.id = outbound_calls.agent_id
      and agents.organization_id in (
        select organization_id from public.user_organizations
        where user_id = auth.uid()
      )
    )
  );
