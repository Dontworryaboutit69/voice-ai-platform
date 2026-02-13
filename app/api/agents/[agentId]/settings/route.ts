import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { business_name, voice_id, status } = await request.json();

    const supabase = createServiceClient();

    // Update agent settings
    const { data, error } = await supabase
      .from('agents')
      .update({
        business_name,
        voice_id,
        status,
        updated_at: new Date().toISOString()
      })
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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

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
