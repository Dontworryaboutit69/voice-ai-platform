import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { sendMessageTakenEmail, sendAppointmentBookedEmail } from "@/lib/services/email.service";

// =============================================================================
// POST /api/webhooks/retell/call-events
// Handles post-call lifecycle webhooks from Retell AI.
// Supported events: call_started, call_ended, call_analyzed.
// =============================================================================

/**
 * Round a duration in seconds up to the nearest whole minute for billing.
 * Minimum billable amount is 1 minute.
 */
function toBillableMinutes(durationSeconds: number): number {
  return Math.max(1, Math.ceil(durationSeconds / 60));
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleCallStarted(
  callData: Record<string, unknown>,
  metadata: Record<string, unknown>,
) {
  try {
    console.log(`[call_started] Starting...`);
    console.log(`[call_started] ENV check:`, {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });

    const supabase = createServiceClient();
    console.log(`[call_started] Client created`);

    const agentId = metadata.agent_id as string;
    console.log(`[call_started] Agent ID: ${agentId}, Call ID: ${callData.call_id}`);

    const insertData = {
      retell_call_id: callData.call_id as string,
      agent_id: agentId,
      from_number: (callData.from_number as string) ?? null,
      to_number: (callData.to_number as string) ?? null,
      started_at: callData.start_timestamp
        ? new Date(callData.start_timestamp as number).toISOString()
        : new Date().toISOString(),
      call_status: "in_progress" as const,
    };

    console.log(`[call_started] Inserting:`, insertData);

    const { data, error } = await supabase
      .from("calls")
      .insert(insertData)
      .select();

    console.log(`[call_started] Insert complete`);
    console.log(`[call_started] Error:`, error);
    console.log(`[call_started] Data:`, data);

    if (error) {
      console.error("[call_started] ❌ INSERT FAILED");
      console.error("[call_started] Error message:", error.message);
      console.error("[call_started] Error code:", error.code);
      console.error("[call_started] Error details:", error.details);
      console.error("[call_started] Error hint:", error.hint);
      console.error("[call_started] Full error:", JSON.stringify(error, null, 2));
    } else {
      console.log(`[call_started] ✅ SUCCESS! Created call for ${callData.call_id}`);
      console.log("[call_started] Result:", JSON.stringify(data));
    }
  } catch (err: any) {
    console.error("[call_started] EXCEPTION:", err);
    console.error("[call_started] Exception message:", err.message);
    console.error("[call_started] Exception stack:", err.stack);
  }
}

async function handleCallEnded(
  callData: Record<string, unknown>,
  metadata: Record<string, unknown>,
) {
  const supabase = createServiceClient();

  const retellCallId = callData.call_id as string;
  const agentId = metadata.agent_id as string;

  console.log(`[call_ended] Agent ID: ${agentId}, Call ID: ${retellCallId}`);

  // Cast transcript: Retell may provide it as a string or as a structured
  // object (transcript_object). We store both forms if available.
  const transcript =
    typeof callData.transcript === "string" ? callData.transcript : null;
  const transcriptObject =
    typeof callData.transcript_object === "object"
      ? (callData.transcript_object as Record<string, unknown>)
      : null;

  const durationMs =
    typeof callData.duration_ms === "number"
      ? callData.duration_ms
      : typeof callData.call_duration_ms === "number"
        ? callData.call_duration_ms
        : null;

  // ------------------------------------------------------------------
  // 1. Update call record
  // ------------------------------------------------------------------
  // Extract latency metrics from Retell's response
  const latency = callData.latency as Record<string, any> | undefined;
  const callCost = callData.call_cost as Record<string, any> | undefined;

  const { data: updatedCall, error: updateError } = await supabase
    .from("calls")
    .update({
      transcript,
      transcript_object: transcriptObject,
      recording_url: (callData.recording_url as string) ?? null,
      ended_at: (callData.end_timestamp as string) ?? new Date().toISOString(),
      duration_ms: durationMs,
      call_status: "completed",
      // Dashboard analytics fields
      disconnection_reason: (callData.disconnection_reason as string) ?? null,
      transfer_destination: (callData.transfer_destination as string) ?? null,
      e2e_latency_p50: latency?.e2e?.p50 ?? null,
      e2e_latency_p90: latency?.e2e?.p90 ?? null,
      e2e_latency_p99: latency?.e2e?.p99 ?? null,
      call_cost_cents: callCost?.combined_cost ?? null,
    })
    .eq("retell_call_id", retellCallId)
    .select("id")
    .single();

  if (updateError) {
    console.error("[call-events] Failed to update call record:", updateError.message);
    return;
  }

  // ------------------------------------------------------------------
  // 2. Create usage record for billing (if applicable)
  // ------------------------------------------------------------------
  if (durationMs != null && updatedCall) {
    const durationSeconds = Math.round(durationMs / 1000);
    const billableMinutes = toBillableMinutes(durationSeconds);

    // Store usage tracking data for future billing
    const { error: usageError } = await supabase.from("usage_tracking").insert({
      agent_id: agentId,
      call_id: updatedCall.id,
      retell_call_id: retellCallId,
      duration_seconds: durationSeconds,
      billable_minutes: billableMinutes,
      resource_type: 'call_minutes',
      quantity: billableMinutes,
      cost_cents: billableMinutes * 10, // $0.10 per minute default
      recorded_at: new Date().toISOString(),
    });

    if (usageError) {
      console.error("[call-events] Failed to insert usage record:", usageError.message);
    }
  }

  // ------------------------------------------------------------------
  // 3. AI Manager evaluation
  // ------------------------------------------------------------------
  // Run asynchronously to not block webhook response
  evaluateCallAsync(updatedCall.id).catch((error) => {
    console.error('[AI Manager] Evaluation failed:', error);
    // Don't throw - webhook should succeed even if evaluation fails
  });

  // ------------------------------------------------------------------
  // 4. Email notifications (async to not block webhook)
  // ------------------------------------------------------------------
  sendCallNotificationAsync(updatedCall.id, agentId, callData).catch((error: unknown) => {
    console.error('[Email Notifications] Failed:', error);
    // Don't throw - webhook should succeed even if email fails
  });

  // ------------------------------------------------------------------
  // 5. CRM Integration Sync (async to not block webhook)
  // ------------------------------------------------------------------
  console.log('[call_ended] Triggering integration sync for call:', updatedCall.id);
  syncToIntegrationsAsync(updatedCall.id, agentId, callData).catch((error: unknown) => {
    console.error('[CRM Integrations] ❌ Sync failed in catch:', {
      callId: updatedCall.id,
      agentId,
      error: error instanceof Error ? error.message : String(error)
    });
    // Don't throw - webhook should succeed even if integration sync fails
  });
}

/**
 * Helper function to run AI Manager evaluation without blocking webhook
 */
async function evaluateCallAsync(callId: string) {
  try {
    const { evaluateCall } = await import('@/lib/services/ai-manager.service');
    await evaluateCall(callId);
  } catch (error) {
    console.error('[AI Manager] Async evaluation error:', error);
  }
}

/**
 * Helper function to send email notifications based on call outcome
 */
async function sendCallNotificationAsync(
  callId: string,
  agentId: string,
  callData: Record<string, unknown>
) {
  try {
    const supabase = createServiceClient();

    // Get agent with owner email and notification preferences
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        id,
        business_name,
        email_notifications_enabled,
        email_message_taken,
        email_appointment_booked,
        organizations (
          id,
          users (
            email
          )
        )
      `)
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      console.error('[Email] Could not fetch agent:', agentError);
      return;
    }

    // Get owner email from organization users
    const ownerEmail = (agent.organizations as any)?.users?.email;
    if (!ownerEmail) {
      console.error('[Email] No owner email found for agent');
      return;
    }

    // Check if email notifications are enabled
    if (!agent.email_notifications_enabled) {
      console.log('[Email] Email notifications disabled for this agent');
      return;
    }

    // Extract transcript object
    const transcriptObject = callData.transcript_object as any;
    if (!transcriptObject || !Array.isArray(transcriptObject)) {
      console.log('[Email] No transcript object available');
      return;
    }

    // Determine call outcome by analyzing transcript
    const outcome = determineCallOutcome(transcriptObject);

    if (outcome.type === 'message_taken' && agent.email_message_taken) {
      // Send message taken email
      await sendMessageTakenEmail({
        to: ownerEmail,
        businessName: agent.business_name,
        customerName: outcome.customerName || 'Unknown',
        customerPhone: outcome.customerPhone || 'Not provided',
        customerEmail: outcome.customerEmail || 'Not provided',
        reason: outcome.reason || 'Customer requested callback',
        callTime: new Date().toISOString(),
        callId: callId,
        agentId: agentId,
      });
      console.log('[Email] Sent message_taken email to:', ownerEmail);
    } else if (outcome.type === 'appointment_booked' && agent.email_appointment_booked) {
      // Send appointment booked email
      await sendAppointmentBookedEmail({
        to: ownerEmail,
        businessName: agent.business_name,
        customerName: outcome.customerName || 'Unknown',
        customerPhone: outcome.customerPhone || 'Not provided',
        customerEmail: outcome.customerEmail || 'Not provided',
        appointmentDate: outcome.appointmentDate || 'TBD',
        appointmentTime: outcome.appointmentTime || 'TBD',
        service: outcome.service || 'General service',
        callId: callId,
        agentId: agentId,
      });
      console.log('[Email] Sent appointment_booked email to:', ownerEmail);
    } else {
      console.log('[Email] No notification needed for call outcome:', outcome.type);
    }
  } catch (error) {
    console.error('[Email] Async notification error:', error);
  }
}

/**
 * Analyze transcript to determine call outcome and extract customer info
 */
function determineCallOutcome(transcript: any[]): {
  type: 'message_taken' | 'appointment_booked' | 'callback_requested' | 'qualified_lead' | 'not_interested' | 'unhappy_customer' | 'other';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  reason?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  service?: string;
} {
  let customerName: string | undefined;
  let customerPhone: string | undefined;
  let customerEmail: string | undefined;
  let hasAppointment = false;
  let appointmentDate: string | undefined;
  let appointmentTime: string | undefined;
  let service: string | undefined;
  let reason: string | undefined;

  // Outcome indicators
  let hasCallback = false;
  let hasInterest = false;
  let notInterested = false;
  let isUnhappy = false;

  // Scan through transcript to extract information
  const fullTranscript = transcript.map(t => t.content || '').join(' ').toLowerCase();

  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    const content = turn.content?.toLowerCase() || '';
    const userContent = turn.role === 'user' ? (turn.content || '') : '';

    // Extract name (look for "my name is" or agent asking "what's your name")
    if (!customerName) {
      if (content.includes('my name is') || content.includes("i'm ")) {
        customerName = extractName(userContent);
      } else if (i > 0 && transcript[i-1].content?.toLowerCase().includes('name')) {
        customerName = extractName(userContent);
      }
    }

    // Extract phone
    if (!customerPhone && turn.role === 'user') {
      const phone = extractPhone(userContent);
      if (phone) customerPhone = phone;
    }

    // Extract email
    if (!customerEmail && turn.role === 'user') {
      const email = extractEmail(userContent);
      if (email) customerEmail = email;
    }

    // Check for appointment booking indicators
    if (content.includes('appointment') || content.includes('booking') || content.includes('schedule') || content.includes('reserved')) {
      hasAppointment = true;
    }

    // Check for callback request
    if (content.match(/\b(call.*back|reach.*back|contact.*later|get back to me)\b/i)) {
      hasCallback = true;
    }

    // Check for interest/lead qualification
    if (content.match(/\b(interested|tell me more|sounds good|pricing|quote|how much|cost)\b/i)) {
      hasInterest = true;
    }

    // Check for not interested
    if (content.match(/\b(not interested|no thanks|don't need|stop calling|remove.*list)\b/i)) {
      notInterested = true;
    }

    // Check for unhappy customer
    if (content.match(/\b(angry|upset|frustrated|terrible|awful|horrible|disappointed|poor|bad service|complaint)\b/i)) {
      isUnhappy = true;
    }

    // Extract appointment details
    if (hasAppointment && !appointmentDate) {
      const dateMatch = content.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next week)/i);
      if (dateMatch) appointmentDate = dateMatch[1];
    }

    if (hasAppointment && !appointmentTime) {
      const timeMatch = content.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/i);
      if (timeMatch) appointmentTime = timeMatch[1];
    }

    // Extract reason/service
    if (!reason && i < 3 && turn.role === 'user') {
      // Customer's early messages usually contain the reason
      if (userContent.length > 10) {
        reason = userContent.substring(0, 100);
      }
    }
  }

  // Determine outcome type (priority order)
  if (hasAppointment && appointmentDate && appointmentTime) {
    return {
      type: 'appointment_booked',
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate,
      appointmentTime,
      service: reason || 'General service',
    };
  } else if (isUnhappy) {
    return {
      type: 'unhappy_customer',
      customerName,
      customerPhone,
      customerEmail,
      reason: reason || 'Customer expressed dissatisfaction',
    };
  } else if (notInterested) {
    return {
      type: 'not_interested',
      customerName,
      customerPhone,
      customerEmail,
      reason: 'Customer declined service',
    };
  } else if (hasCallback) {
    return {
      type: 'callback_requested',
      customerName,
      customerPhone,
      customerEmail,
      reason: reason || 'Customer requested callback',
    };
  } else if (hasInterest && customerName && customerPhone) {
    return {
      type: 'qualified_lead',
      customerName,
      customerPhone,
      customerEmail,
      reason: reason || 'Customer expressed interest',
    };
  } else if (customerName && customerPhone) {
    // If we collected name and phone but no clear outcome, it's a message
    return {
      type: 'message_taken',
      customerName,
      customerPhone,
      customerEmail,
      reason: reason || 'Customer left contact information',
    };
  }

  return { type: 'other' };
}

/**
 * Extract name from user message
 */
function extractName(text: string): string | undefined {
  // Remove common phrases
  let cleaned = text
    .replace(/my name is /i, '')
    .replace(/i'm /i, '')
    .replace(/this is /i, '')
    .trim();

  // Take first 2-3 words as potential name
  const words = cleaned.split(/\s+/).slice(0, 3);
  if (words.length > 0 && words[0].length > 1) {
    return words.join(' ');
  }
  return undefined;
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string | undefined {
  // Match various phone formats
  const phoneRegex = /(\+?1?\s*\(?[\d]{3}\)?[\s.-]?[\d]{3}[\s.-]?[\d]{4})/;
  const match = text.match(phoneRegex);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string | undefined {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const match = text.match(emailRegex);
  return match ? match[0].trim() : undefined;
}

async function handleCallAnalyzed(
  callData: Record<string, unknown>,
) {
  const supabase = createServiceClient();

  const retellCallId = callData.call_id as string;
  const analysis = callData.call_analysis as Record<string, unknown> | undefined;

  // Build update payload with analysis + promoted columns for dashboard aggregation
  const updatePayload: Record<string, any> = {
    call_analysis: analysis ?? null,
  };
  if (analysis) {
    updatePayload.user_sentiment = (analysis.user_sentiment as string) ?? null;
    updatePayload.call_successful = (analysis.call_successful as boolean) ?? null;
  }

  const { error } = await supabase
    .from("calls")
    .update(updatePayload)
    .eq("retell_call_id", retellCallId);

  if (error) {
    console.error("[call-events] Failed to update call analysis:", error.message);
  }
}

/**
 * Sync call data to connected CRM integrations
 */
async function syncToIntegrationsAsync(
  callId: string,
  agentId: string,
  callData: Record<string, unknown>
) {
  try {
    console.log('[CRM Integrations] Starting sync for call:', callId);

    const supabase = createServiceClient();

    // Get call details
    const { data: call } = await supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (!call) {
      console.log('[CRM Integrations] Call not found:', callId);
      return;
    }

    // Analyze call to extract customer data
    const outcome = determineCallOutcome(call.transcript_object);

    // Build call data for integrations
    const integrationCallData = {
      callId: call.id,
      agentId: agentId,
      customerName: outcome.customerName,
      customerPhone: outcome.customerPhone,
      customerEmail: outcome.customerEmail,
      callOutcome: outcome.type,
      callSummary: `Call with ${outcome.customerName || 'customer'}. ${outcome.reason || outcome.service || 'No additional details.'}`,
      callSentiment: 'neutral', // TODO: Add sentiment analysis
      transcript: call.transcript,
      recordingUrl: call.recording_url,
      startedAt: new Date(call.started_at),
      endedAt: new Date(call.ended_at),
      durationSeconds: call.duration_ms ? Math.floor(call.duration_ms / 1000) : 0,
      // Don't pass appointmentBooked — the book_appointment tool already
      // created the appointment during the call. Passing it here would
      // cause processCallData to create a duplicate appointment in GHL.
      appointmentBooked: undefined,
    };

    // Import integration factory
    const { processCallThroughIntegrations } = await import('@/lib/integrations/integration-factory');

    // Process through all connected integrations
    await processCallThroughIntegrations(agentId, integrationCallData);

    console.log('[CRM Integrations] ✅ Sync complete for call:', callId);

  } catch (error: any) {
    console.error('[CRM Integrations] ❌ Sync error:', {
      message: error?.message,
      stack: error?.stack,
      callId,
      agentId,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    // Don't throw - let webhook succeed even if integration sync fails
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

// GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Retell webhook endpoint is reachable',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    console.log('[Retell Webhook] ===== WEBHOOK RECEIVED =====');
    console.log('[Retell Webhook] Time:', new Date().toISOString());
    console.log('[Retell Webhook] Headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.json();

    console.log('[Retell Webhook] Body:', JSON.stringify(body, null, 2));
    console.log('[Retell Webhook] Event:', body.event || 'unknown');
    console.log('[Retell Webhook] Call ID:', body.call?.call_id || body.data?.call_id || 'unknown');

    const event: string | undefined = body.event;
    const callData = (body.call ?? body.data ?? body) as Record<string, unknown>;
    const metadata = (callData.metadata ?? {}) as Record<string, unknown>;

    if (!event) {
      console.error('[Retell Webhook] Missing event type in body:', body);
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 },
      );
    }

    switch (event) {
      case "call_started":
        await handleCallStarted(callData, metadata);
        break;

      case "call_ended":
        await handleCallEnded(callData, metadata);
        break;

      case "call_analyzed":
        await handleCallAnalyzed(callData);
        break;

      default:
        // Unknown event types are silently accepted (forward compatibility).
        console.warn("[call-events] Unknown event type:", event);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[call-events] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
