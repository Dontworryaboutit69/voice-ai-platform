-- Integration System for CRM Connections
-- Supports: Google Calendar, GoHighLevel, Zapier, Housecall Pro, HubSpot, Salesforce

-- Store integration connections per agent
create table public.integration_connections (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,

  -- Integration type
  integration_type text not null check (integration_type in (
    'google_calendar',
    'gohighlevel',
    'zapier',
    'housecall_pro',
    'hubspot',
    'salesforce'
  )),

  -- Connection status
  is_active boolean default true,
  connection_status text default 'connected' check (connection_status in (
    'connected',
    'disconnected',
    'error',
    'expired'
  )),

  -- Authentication credentials (encrypted)
  auth_type text not null check (auth_type in ('oauth', 'api_key', 'webhook')),

  -- For OAuth integrations (Google Calendar, HubSpot)
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,

  -- For API key integrations (GoHighLevel, Housecall Pro, Salesforce)
  api_key text,
  api_secret text,
  instance_url text, -- For Salesforce

  -- For webhook integrations (Zapier)
  webhook_url text,
  webhook_secret text,

  -- Integration-specific configuration
  config jsonb default '{}'::jsonb,
  -- Example for Google Calendar: { "calendar_id": "primary", "timezone": "America/New_York" }
  -- Example for GoHighLevel: { "location_id": "abc123", "pipeline_id": "xyz789" }
  -- Example for Housecall Pro: { "dispatch_board_id": "123" }

  -- Sync settings
  sync_enabled boolean default true,
  sync_contacts boolean default true,
  sync_appointments boolean default true,
  sync_notes boolean default true,
  last_sync_at timestamptz,
  last_error text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(agent_id, integration_type)
);

-- Store custom field mappings per integration
create table public.integration_field_mappings (
  id uuid primary key default uuid_generate_v4(),
  integration_connection_id uuid references public.integration_connections(id) on delete cascade not null,

  -- What we're mapping (contacts, appointments, etc.)
  entity_type text not null check (entity_type in ('contact', 'appointment', 'note', 'task')),

  -- Field mappings: our field -> their field
  field_mappings jsonb not null default '{}'::jsonb,
  -- Example: {
  --   "customer_name": "firstName",
  --   "customer_phone": "phone",
  --   "customer_email": "email",
  --   "call_summary": "notes",
  --   "appointment_date": "scheduledDate"
  -- }

  -- Transformation rules (optional)
  transformations jsonb default '{}'::jsonb,
  -- Example: { "phone": "normalize_us_phone", "date": "convert_to_timezone" }

  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Track all sync operations for debugging
create table public.integration_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  integration_connection_id uuid references public.integration_connections(id) on delete cascade,
  call_id uuid references public.calls(id) on delete set null,

  -- What was synced
  operation_type text not null check (operation_type in (
    'create_contact',
    'update_contact',
    'create_note',
    'create_appointment',
    'trigger_webhook',
    'outbound_call_request'
  )),

  -- Direction of sync
  direction text not null check (direction in ('outbound', 'inbound')),

  -- Status
  status text not null default 'pending' check (status in (
    'pending',
    'processing',
    'success',
    'failed',
    'retrying'
  )),

  -- Data sent/received
  request_payload jsonb,
  response_data jsonb,
  error_message text,
  error_code text,

  -- Retry tracking
  retry_count integer default 0,
  max_retries integer default 3,
  next_retry_at timestamptz,

  -- Timing
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_ms integer,

  created_at timestamptz default now()
);

-- Store webhook signatures for outbound call triggers
create table public.integration_webhooks (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,

  -- Webhook identification
  webhook_name text not null,
  webhook_type text default 'outbound_call_trigger' check (webhook_type in (
    'outbound_call_trigger',
    'contact_created',
    'appointment_booked',
    'custom'
  )),

  -- Security
  webhook_secret text not null, -- For signature verification
  is_active boolean default true,

  -- Expected payload schema (for validation)
  payload_schema jsonb,
  -- Example: {
  --   "required_fields": ["phone_number", "contact_name"],
  --   "optional_fields": ["email", "custom_data"]
  -- }

  -- Tracking
  total_calls_received integer default 0,
  last_call_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(agent_id, webhook_name)
);

-- Post-call data to send to integrations
create table public.call_integration_data (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references public.calls(id) on delete cascade not null,
  agent_id uuid references public.agents(id) not null,

  -- Standardized extracted data
  customer_name text,
  customer_phone text,
  customer_email text,
  customer_address text,

  -- Call metadata
  call_outcome text, -- 'appointment_booked', 'message_taken', 'qualified_lead', 'not_interested'
  call_summary text,
  call_sentiment text, -- 'positive', 'neutral', 'negative'

  -- Appointment details (if booked)
  appointment_date date,
  appointment_time time,
  appointment_timezone text,
  service_requested text,

  -- Additional custom fields
  custom_fields jsonb default '{}'::jsonb,

  -- Processing status
  is_synced boolean default false,
  synced_to_integrations text[], -- Array of integration types synced
  sync_errors jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index idx_integration_connections_agent on public.integration_connections(agent_id);
create index idx_integration_connections_org on public.integration_connections(organization_id);
create index idx_integration_connections_type on public.integration_connections(integration_type);
create index idx_integration_sync_logs_connection on public.integration_sync_logs(integration_connection_id);
create index idx_integration_sync_logs_call on public.integration_sync_logs(call_id);
create index idx_integration_sync_logs_status on public.integration_sync_logs(status);
create index idx_call_integration_data_call on public.call_integration_data(call_id);
create index idx_call_integration_data_agent on public.call_integration_data(agent_id);

-- RLS Policies
alter table public.integration_connections enable row level security;
alter table public.integration_field_mappings enable row level security;
alter table public.integration_sync_logs enable row level security;
alter table public.integration_webhooks enable row level security;
alter table public.call_integration_data enable row level security;

-- Users can only access integrations for their organization
create policy "Users can view their org's integrations"
  on public.integration_connections for select
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

create policy "Users can manage their org's integrations"
  on public.integration_connections for all
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Field mappings follow integration connection access
create policy "Users can view their integration field mappings"
  on public.integration_field_mappings for select
  using (
    integration_connection_id in (
      select id from public.integration_connections
      where organization_id in (
        select organization_id from public.organization_members
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can manage their integration field mappings"
  on public.integration_field_mappings for all
  using (
    integration_connection_id in (
      select id from public.integration_connections
      where organization_id in (
        select organization_id from public.organization_members
        where user_id = auth.uid()
      )
    )
  );

-- Sync logs follow integration connection access
create policy "Users can view their integration sync logs"
  on public.integration_sync_logs for select
  using (
    integration_connection_id in (
      select id from public.integration_connections
      where organization_id in (
        select organization_id from public.organization_members
        where user_id = auth.uid()
      )
    )
  );

-- Webhooks follow organization access
create policy "Users can view their org's webhooks"
  on public.integration_webhooks for select
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

create policy "Users can manage their org's webhooks"
  on public.integration_webhooks for all
  using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Call integration data follows agent access
create policy "Users can view call integration data for their agents"
  on public.call_integration_data for select
  using (
    agent_id in (
      select id from public.agents
      where organization_id in (
        select organization_id from public.organization_members
        where user_id = auth.uid()
      )
    )
  );

-- Updated_at trigger for integration_connections
create or replace function public.handle_integration_connections_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger integration_connections_updated_at
  before update on public.integration_connections
  for each row
  execute function public.handle_integration_connections_updated_at();

-- Updated_at trigger for call_integration_data
create or replace function public.handle_call_integration_data_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger call_integration_data_updated_at
  before update on public.call_integration_data
  for each row
  execute function public.handle_call_integration_data_updated_at();
