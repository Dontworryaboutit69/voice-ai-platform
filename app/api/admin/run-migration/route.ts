import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Create the agent_data_collection_configs table
    const createTableSQL = `
      -- Configuration for what data to extract from calls using Retell's post-call analysis
      create table if not exists public.agent_data_collection_configs (
        id uuid primary key default uuid_generate_v4(),
        agent_id uuid references public.agents(id) on delete cascade not null unique,

        -- Field definitions (what to extract)
        fields jsonb not null default '[]'::jsonb,

        -- Retell post-call analysis configuration
        retell_analysis_config jsonb default '{}'::jsonb,

        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
    `;

    // Enable RLS
    const enableRLSSQL = `
      alter table public.agent_data_collection_configs enable row level security;
    `;

    // Create policies
    const createPoliciesSQL = `
      -- Drop existing policies if they exist
      drop policy if exists "Users can view data collection configs" on public.agent_data_collection_configs;
      drop policy if exists "Users can insert data collection configs" on public.agent_data_collection_configs;
      drop policy if exists "Users can update data collection configs" on public.agent_data_collection_configs;

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
    `;

    // Create trigger
    const createTriggerSQL = `
      drop trigger if exists update_data_collection_configs_updated_at on public.agent_data_collection_configs;

      create trigger update_data_collection_configs_updated_at
        before update on public.agent_data_collection_configs
        for each row
        execute function public.update_updated_at_column();
    `;

    // Create index
    const createIndexSQL = `
      drop index if exists agent_data_collection_configs_agent_id_idx;

      create index agent_data_collection_configs_agent_id_idx
        on public.agent_data_collection_configs(agent_id);
    `;

    console.log('Creating table...');
    const { error: tableError } = await supabase.rpc('exec', { sql: createTableSQL });
    if (tableError) console.error('Table error:', tableError);

    console.log('Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec', { sql: enableRLSSQL });
    if (rlsError) console.error('RLS error:', rlsError);

    console.log('Creating policies...');
    const { error: policiesError } = await supabase.rpc('exec', { sql: createPoliciesSQL });
    if (policiesError) console.error('Policies error:', policiesError);

    console.log('Creating trigger...');
    const { error: triggerError } = await supabase.rpc('exec', { sql: createTriggerSQL });
    if (triggerError) console.error('Trigger error:', triggerError);

    console.log('Creating index...');
    const { error: indexError } = await supabase.rpc('exec', { sql: createIndexSQL });
    if (indexError) console.error('Index error:', indexError);

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to run migration', details: error },
      { status: 500 }
    );
  }
}
