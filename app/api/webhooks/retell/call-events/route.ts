import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

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
  const { data: updatedCall, error: updateError } = await supabase
    .from("calls")
    .update({
      transcript,
      transcript_object: transcriptObject,
      recording_url: (callData.recording_url as string) ?? null,
      ended_at: (callData.end_timestamp as string) ?? new Date().toISOString(),
      duration_ms: durationMs,
      call_status: "completed",
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
}

async function handleCallAnalyzed(
  callData: Record<string, unknown>,
) {
  const supabase = createServiceClient();

  const retellCallId = callData.call_id as string;
  const analysis = callData.call_analysis as Record<string, unknown> | undefined;

  const { error } = await supabase
    .from("calls")
    .update({
      call_analysis: analysis ?? null,
    })
    .eq("retell_call_id", retellCallId);

  if (error) {
    console.error("[call-events] Failed to update call analysis:", error.message);
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
