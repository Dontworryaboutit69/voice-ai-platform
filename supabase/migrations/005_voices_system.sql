-- Custom voices table (user's cloned voices and favorites)
create table if not exists public.custom_voices (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,

  -- Voice identification
  voice_id text not null, -- Could be ElevenLabs voice_id or Retell voice_id
  voice_name text not null,
  provider text not null check (provider in ('elevenlabs', 'retell', 'openai', 'deepgram', 'cartesia')),

  -- Voice metadata
  gender text check (gender in ('male', 'female', 'neutral')),
  accent text,
  age text,
  language text,
  use_case text, -- 'conversational', 'narrative', etc.

  -- Audio samples
  preview_audio_url text,

  -- For cloned voices
  is_cloned boolean default false,
  source_audio_url text,
  cloning_status text check (cloning_status in ('pending', 'processing', 'ready', 'failed')),

  -- User organization
  is_favorite boolean default false,
  is_default boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure voice_id is unique per organization
  unique(organization_id, voice_id, provider)
);

-- Add voice settings to agents table
alter table public.agents
  add column if not exists test_voice_id text, -- Voice used during testing
  add column if not exists voice_provider text default 'elevenlabs'; -- Provider for the voice

-- Index for faster lookups
create index if not exists idx_custom_voices_org on public.custom_voices(organization_id);
create index if not exists idx_custom_voices_provider on public.custom_voices(provider);
create index if not exists idx_custom_voices_favorites on public.custom_voices(organization_id, is_favorite) where is_favorite = true;

-- RLS Policies
alter table public.custom_voices enable row level security;

create policy "Users can view their organization's voices"
  on public.custom_voices for select
  using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "Users can insert voices to their organization"
  on public.custom_voices for insert
  with check (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "Users can update their organization's voices"
  on public.custom_voices for update
  using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "Users can delete their organization's voices"
  on public.custom_voices for delete
  using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

-- Voice usage tracking (for analytics)
create table if not exists public.voice_usage (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  voice_id text not null,
  provider text not null,

  usage_type text check (usage_type in ('preview', 'test_call', 'production_call')),
  duration_seconds integer,

  created_at timestamptz default now()
);

create index if not exists idx_voice_usage_org on public.voice_usage(organization_id);
create index if not exists idx_voice_usage_created on public.voice_usage(created_at);

alter table public.voice_usage enable row level security;

create policy "Users can view their organization's voice usage"
  on public.voice_usage for select
  using (
    organization_id in (
      select organization_id from public.users where id = auth.uid()
    )
  );

create policy "System can insert voice usage"
  on public.voice_usage for insert
  with check (true);
