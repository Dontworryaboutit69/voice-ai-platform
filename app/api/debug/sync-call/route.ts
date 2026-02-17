import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { callId } = await request.json();

    if (!callId) {
      return NextResponse.json({ error: 'callId required' }, { status: 400 });
    }

    console.log('[DEBUG] Manual sync requested for call:', callId);

    const supabase = createServiceClient();

    // Get call details
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (callError || !call) {
      console.error('[DEBUG] Call not found:', callError);
      return NextResponse.json({ error: 'Call not found', details: callError }, { status: 404 });
    }

    console.log('[DEBUG] Call found:', {
      id: call.id,
      retell_call_id: call.retell_call_id,
      agent_id: call.agent_id,
      has_transcript: !!call.transcript,
      transcript_length: call.transcript?.length,
      has_transcript_object: !!call.transcript_object,
      transcript_object_length: Array.isArray(call.transcript_object) ? call.transcript_object.length : 0
    });

    // Analyze transcript
    console.log('[DEBUG] Raw transcript_object:', JSON.stringify(call.transcript_object, null, 2));

    const outcome = analyzeTranscript(call.transcript_object);
    console.log('[DEBUG] Analyzed outcome:', JSON.stringify(outcome, null, 2));

    // Check for GHL integration
    const { data: ghlIntegration, error: integrationError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('agent_id', call.agent_id)
      .eq('integration_type', 'gohighlevel')
      .eq('is_active', true)
      .single();

    if (integrationError || !ghlIntegration) {
      console.error('[DEBUG] No GHL integration found:', integrationError);
      return NextResponse.json({
        error: 'No active GHL integration',
        details: integrationError
      }, { status: 404 });
    }

    console.log('[DEBUG] GHL integration found:', {
      id: ghlIntegration.id,
      has_api_key: !!ghlIntegration.api_key,
      api_key_length: ghlIntegration.api_key?.length,
      location_id: ghlIntegration.config?.location_id,
      calendar_id: ghlIntegration.config?.calendar_id,
      createContacts: ghlIntegration.config?.createContacts
    });

    // Build call data
    const integrationCallData = {
      callId: call.id,
      agentId: call.agent_id,
      customerName: outcome.customerName,
      customerPhone: outcome.customerPhone,
      customerEmail: outcome.customerEmail,
      callOutcome: outcome.type,
      callSummary: `Call with ${outcome.customerName || 'customer'}. ${outcome.reason || 'No additional details.'}`,
      callSentiment: 'neutral',
      transcript: call.transcript,
      recordingUrl: call.recording_url,
      startedAt: new Date(call.started_at),
      endedAt: call.ended_at ? new Date(call.ended_at) : new Date(),
      durationSeconds: call.duration_ms ? Math.floor(call.duration_ms / 1000) : 0,
    };

    console.log('[DEBUG] Integration call data:', JSON.stringify(integrationCallData, null, 2));

    // Attempt sync
    const { processCallThroughIntegrations } = await import('@/lib/integrations/integration-factory');

    console.log('[DEBUG] Calling processCallThroughIntegrations...');
    await processCallThroughIntegrations(call.agent_id, integrationCallData);
    console.log('[DEBUG] ✅ processCallThroughIntegrations completed');

    // Check for sync logs
    const { data: syncLogs } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('call_id', call.id)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('[DEBUG] Sync logs created:', syncLogs);

    return NextResponse.json({
      success: true,
      call: {
        id: call.id,
        retell_call_id: call.retell_call_id,
        transcript_length: call.transcript?.length
      },
      outcome,
      integration: {
        id: ghlIntegration.id,
        type: ghlIntegration.integration_type,
        has_api_key: !!ghlIntegration.api_key
      },
      syncLogs: syncLogs || []
    });

  } catch (error: any) {
    console.error('[DEBUG] Sync error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

function analyzeTranscript(transcript: any): {
  type: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  reason?: string;
} {
  let customerName: string | undefined;
  let customerPhone: string | undefined;
  let customerEmail: string | undefined;
  let reason: string | undefined;

  if (!Array.isArray(transcript)) {
    console.log('[DEBUG] Transcript is not an array:', typeof transcript);
    return { type: 'other' };
  }

  console.log('[DEBUG] Analyzing', transcript.length, 'turns');

  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    const content = turn.content?.toLowerCase() || '';
    const userContent = turn.role === 'user' ? (turn.content || '') : '';

    console.log(`[DEBUG] Turn ${i}: role=${turn.role}, content length=${turn.content?.length}, content="${turn.content?.substring(0, 100)}"`);

    // Extract name
    if (!customerName && turn.role === 'user') {
      if (content.includes('my name is') || content.includes("i'm ")) {
        const cleaned = userContent
          .replace(/my name is /i, '')
          .replace(/i'm /i, '')
          .replace(/this is /i, '')
          .trim();
        const words = cleaned.split(/\s+/).slice(0, 3);
        if (words.length > 0 && words[0].length > 1) {
          customerName = words.join(' ');
          console.log('[DEBUG] Extracted name:', customerName);
        }
      }
    }

    // Extract phone
    if (!customerPhone && turn.role === 'user') {
      const phoneMatch = userContent.match(/(\+?1?\s*\(?[\d]{3}\)?[\s.-]?[\d]{3}[\s.-]?[\d]{4})/);
      if (phoneMatch) {
        customerPhone = phoneMatch[1].trim();
        console.log('[DEBUG] Extracted phone:', customerPhone);
      }
    }

    // Extract email
    if (!customerEmail && turn.role === 'user') {
      const emailMatch = userContent.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        customerEmail = emailMatch[0].trim();
        console.log('[DEBUG] Extracted email:', customerEmail);
      }
    }

    // Extract reason (from early user messages)
    if (!reason && i < 3 && turn.role === 'user' && userContent.length > 10) {
      reason = userContent.substring(0, 100);
      console.log('[DEBUG] Extracted reason:', reason);
    }
  }

  const type = customerName && customerPhone ? 'message_taken' : 'other';
  console.log('[DEBUG] Final outcome:', { type, customerName, customerPhone, customerEmail, reason });

  return {
    type,
    customerName,
    customerPhone,
    customerEmail,
    reason,
  };
}
