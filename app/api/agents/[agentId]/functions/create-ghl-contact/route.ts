import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { name, email, phone, notes } = await request.json();

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: 'Name and at least one contact method (email or phone) are required' },
        { status: 400 }
      );
    }

    // Get GoHighLevel integration credentials
    const supabase = createServiceClient();
    const { data: integration } = await supabase
      .from('agent_integrations')
      .select('credentials, settings')
      .eq('agent_id', agentId)
      .eq('integration_type', 'gohighlevel')
      .eq('is_active', true)
      .single();

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'GoHighLevel integration not configured' },
        { status: 400 }
      );
    }

    // Call GoHighLevel API to create contact
    const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId: integration.credentials.locationId,
        name,
        email,
        phone,
        source: 'Voice AI Agent',
        tags: ['voice-ai-lead'],
        customFields: notes ? [{ key: 'notes', value: notes }] : []
      })
    });

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      contact_id: data.contact?.id,
      message: 'Contact created successfully in GoHighLevel'
    });

  } catch (error: any) {
    console.error('Error creating GHL contact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create contact' },
      { status: 500 }
    );
  }
}
