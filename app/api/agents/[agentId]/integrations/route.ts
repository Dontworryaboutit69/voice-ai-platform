import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { IntegrationFactory } from '@/lib/integrations/integration-factory';

// GET - List all integrations for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    const { data: integrations, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Integrations API] Error fetching integrations:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Add metadata for each integration
    const integrationsWithMetadata = (integrations || []).map(integration => ({
      ...integration,
      metadata: IntegrationFactory.getMetadata(integration.integration_type),
    }));

    return NextResponse.json({
      success: true,
      integrations: integrationsWithMetadata
    });

  } catch (error: any) {
    console.error('[Integrations API] Error in GET:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST - Create new integration
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    const {
      integration_type,
      api_key,
      api_secret,
      webhook_url,
      config = {},
    } = body;

    // Validate integration type
    if (!IntegrationFactory.getAvailableTypes().includes(integration_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid integration type' },
        { status: 400 }
      );
    }

    // Validate config
    const validation = IntegrationFactory.validateConfig(integration_type, config);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get agent to verify access and get organization_id
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('organization_id')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Determine auth type
    const metadata = IntegrationFactory.getMetadata(integration_type);
    const auth_type = metadata.authType;

    // Prepare connection data
    const connectionData: any = {
      agent_id: agentId,
      organization_id: agent.organization_id,
      integration_type,
      auth_type,
      config,
      is_active: true,
      connection_status: 'connected',
    };

    // Add credentials based on auth type
    if (auth_type === 'api_key') {
      if (!api_key) {
        return NextResponse.json(
          { success: false, error: 'API key is required' },
          { status: 400 }
        );
      }
      connectionData.api_key = api_key;
      if (api_secret) {
        connectionData.api_secret = api_secret;
      }
    } else if (auth_type === 'webhook') {
      if (!webhook_url) {
        return NextResponse.json(
          { success: false, error: 'Webhook URL is required' },
          { status: 400 }
        );
      }
      connectionData.webhook_url = webhook_url;
    }

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integration_connections')
      .select('id')
      .eq('agent_id', agentId)
      .eq('integration_type', integration_type)
      .single();

    let integration;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('integration_connections')
        .update(connectionData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[Integrations API] Error updating integration:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update integration' },
          { status: 500 }
        );
      }

      integration = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('integration_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) {
        console.error('[Integrations API] Error creating integration:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create integration' },
          { status: 500 }
        );
      }

      integration = data;
    }

    // Test the connection
    const integrationInstance = IntegrationFactory.create(integration);
    const testResult = await integrationInstance.validateConnection();

    if (!testResult.success) {
      // Update status to error
      await supabase
        .from('integration_connections')
        .update({
          connection_status: 'error',
          last_error: testResult.error,
        })
        .eq('id', integration.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Connection test failed',
          details: testResult.error,
        },
        { status: 400 }
      );
    }

    // Register calendar availability check tool with Retell if this is a calendar integration
    if (['gohighlevel', 'google-calendar', 'calendly'].includes(integration_type)) {
      try {
        const { data: agent } = await supabase
          .from('agents')
          .select('retell_agent_id')
          .eq('id', agentId)
          .single();

        if (agent?.retell_agent_id) {
          const { updateRetellAgentTools } = await import('@/lib/retell-tools');
          const result = await updateRetellAgentTools(agent.retell_agent_id, agentId, [integration_type]);

          if (result.success) {
            console.log(`✅ Registered calendar availability tool with Retell for agent ${agentId}`);
          } else {
            console.error(`⚠️ Failed to register Retell tools: ${result.error}`);
            // Don't fail the whole integration, just log the error
          }
        }
      } catch (toolError) {
        console.error('Error registering Retell tools:', toolError);
        // Don't fail the whole integration
      }
    }

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        metadata: IntegrationFactory.getMetadata(integration_type),
      },
      message: 'Integration connected successfully',
    });

  } catch (error: any) {
    console.error('[Integrations API] Error in POST:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create integration' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect an integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const integration_type = searchParams.get('type');

    if (!integration_type) {
      return NextResponse.json(
        { success: false, error: 'Integration type is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('agent_id', agentId)
      .eq('integration_type', integration_type);

    if (error) {
      console.error('[Integrations API] Error deleting integration:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Integration disconnected successfully',
    });

  } catch (error: any) {
    console.error('[Integrations API] Error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: Prompt updates for integrations happen automatically during call sync
// No need to manually update prompts here
