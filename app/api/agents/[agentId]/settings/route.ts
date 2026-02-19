import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { getAppUrl } from '@/lib/retell-tools';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const {
      business_name,
      voice_id,
      status,
      email_notifications_enabled,
      email_message_taken,
      email_appointment_booked,
      email_daily_summary
    } = await request.json();

    const supabase = createServiceClient();

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (business_name !== undefined) updateData.business_name = business_name;
    if (voice_id !== undefined) updateData.voice_id = voice_id;
    if (status !== undefined) updateData.status = status;
    if (email_notifications_enabled !== undefined) updateData.email_notifications_enabled = email_notifications_enabled;
    if (email_message_taken !== undefined) updateData.email_message_taken = email_message_taken;
    if (email_appointment_booked !== undefined) updateData.email_appointment_booked = email_appointment_booked;
    if (email_daily_summary !== undefined) updateData.email_daily_summary = email_daily_summary;

    // Update agent settings
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    // Update Retell agent if connected
    if (data.retell_agent_id) {
      try {
        // Configure webhook URL to ensure calls are tracked
        const appUrl = getAppUrl();

        await fetch(`https://api.retellai.com/update-agent`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            agent_id: data.retell_agent_id,
            agent_name: business_name,
            voice_id: voice_id,
            webhook_url: `${appUrl}/api/webhooks/retell/call-events`
          })
        });
      } catch (retellError) {
        console.error('Error updating Retell agent:', retellError);
        // Don't fail the whole request if Retell update fails
      }
    }

    return NextResponse.json({
      success: true,
      agent: data
    });

  } catch (error: any) {
    console.error('Error in settings API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
