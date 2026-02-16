-- OAuth state tracking for CSRF protection
create table if not exists public.oauth_states (
  id uuid primary key default uuid_generate_v4(),
  state text unique not null,
  agent_id uuid references public.agents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null, -- 'hubspot', 'salesforce', 'google_calendar', etc.
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Index for fast lookups
create index if not exists idx_oauth_states_state on public.oauth_states(state);
create index if not exists idx_oauth_states_expires_at on public.oauth_states(expires_at);

-- RLS policies
alter table public.oauth_states enable row level security;

create policy "Users can manage their own OAuth states"
  on public.oauth_states
  for all
  using (auth.uid() = user_id);

-- Clean up expired states (run periodically via cron or manual cleanup)
create or replace function clean_expired_oauth_states()
returns void as $$
begin
  delete from public.oauth_states
  where expires_at < now();
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function clean_expired_oauth_states() to authenticated;

comment on table public.oauth_states is 'Temporary storage for OAuth state parameters to prevent CSRF attacks';
