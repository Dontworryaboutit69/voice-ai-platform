import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { sendDailySummaryEmail } from '@/lib/services/email.service';

// =============================================================================
// GET /api/cron/daily-summary
// Vercel Cron: Runs daily at 9:00 AM to send summary emails
// Only sends if agent had calls in the last 24 hours
// =============================================================================

export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get date range: last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log('[Cron] Daily summary starting...', {
      from: yesterday.toISOString(),
      to: now.toISOString(),
    });

    // Get all agents with their organizations and owners
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select(`
        id,
        business_name,
        status,
        email_notifications_enabled,
        email_daily_summary,
        organizations (
          id,
          users (
            email
          )
        )
      `)
      .eq('status', 'active') // Only active agents
      .eq('email_notifications_enabled', true) // Only agents with notifications enabled
      .eq('email_daily_summary', true); // Only agents with daily summary enabled

    if (agentsError || !agents) {
      console.error('[Cron] Failed to fetch agents:', agentsError);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    console.log(`[Cron] Found ${agents.length} active agents`);

    let emailsSent = 0;
    let agentsSkipped = 0;

    // Process each agent
    for (const agent of agents) {
      const ownerEmail = (agent.organizations as any)?.users?.email;
      if (!ownerEmail) {
        console.log(`[Cron] Skipping agent ${agent.id}: no owner email`);
        agentsSkipped++;
        continue;
      }

      // Get calls from last 24 hours for this agent
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('agent_id', agent.id)
        .gte('started_at', yesterday.toISOString())
        .lte('started_at', now.toISOString())
        .order('started_at', { ascending: false });

      if (callsError) {
        console.error(`[Cron] Failed to fetch calls for agent ${agent.id}:`, callsError);
        continue;
      }

      // Skip if no calls in last 24 hours
      if (!calls || calls.length === 0) {
        console.log(`[Cron] Skipping agent ${agent.id}: no calls in last 24 hours`);
        agentsSkipped++;
        continue;
      }

      console.log(`[Cron] Agent ${agent.id} had ${calls.length} calls`);

      // Calculate statistics
      const totalCalls = calls.length;
      const totalDuration = calls.reduce((sum, call) => {
        return sum + (call.duration_ms || 0);
      }, 0);
      const avgDurationSeconds = Math.round(totalDuration / totalCalls / 1000);

      // Count outcomes (simplified - check call_analysis or transcript)
      let appointmentsBooked = 0;
      let messagesTaken = 0;

      for (const call of calls) {
        const analysis = call.call_analysis as any;
        const transcript = (call.transcript || '').toLowerCase();

        // Simple heuristic: check for appointment or message keywords
        if (
          analysis?.outcome === 'appointment_booked' ||
          transcript.includes('appointment') ||
          transcript.includes('booked') ||
          transcript.includes('scheduled')
        ) {
          appointmentsBooked++;
        } else if (
          analysis?.outcome === 'message_taken' ||
          transcript.includes('message') ||
          transcript.includes('callback')
        ) {
          messagesTaken++;
        }
      }

      // Format recent calls for email
      const recentCalls = calls.slice(0, 5).map(call => {
        const duration = call.duration_ms
          ? `${Math.floor(call.duration_ms / 1000 / 60)}m ${Math.floor((call.duration_ms / 1000) % 60)}s`
          : 'Unknown';

        return {
          time: new Date(call.started_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          from: call.from_number || 'Unknown',
          duration,
          outcome: determineOutcome(call),
        };
      });

      // Send daily summary email
      try {
        await sendDailySummaryEmail({
          to: ownerEmail,
          businessName: agent.business_name,
          date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
          totalCalls,
          appointmentsBooked,
          messagesTaken,
          callDetails: recentCalls.map((c: any) => ({
            id: c.id || '',
            time: c.time || '',
            duration: c.duration || '',
            outcome: c.outcome || '',
            customerName: c.customerName,
          })),
          agentId: agent.id,
        });

        emailsSent++;
        console.log(`[Cron] Sent daily summary to ${ownerEmail} for agent ${agent.business_name}`);
      } catch (emailError) {
        console.error(`[Cron] Failed to send email to ${ownerEmail}:`, emailError);
      }
    }

    console.log('[Cron] Daily summary complete', {
      totalAgents: agents.length,
      emailsSent,
      agentsSkipped,
    });

    return NextResponse.json({
      success: true,
      totalAgents: agents.length,
      emailsSent,
      agentsSkipped,
    });
  } catch (error: any) {
    console.error('[Cron] Daily summary error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Determine call outcome from call data
 */
function determineOutcome(call: any): string {
  const analysis = call.call_analysis as any;
  const transcript = (call.transcript || '').toLowerCase();

  if (analysis?.outcome) {
    return analysis.outcome;
  }

  if (transcript.includes('appointment') || transcript.includes('booked')) {
    return 'Appointment Booked';
  }

  if (transcript.includes('message') || transcript.includes('callback')) {
    return 'Message Taken';
  }

  if (call.duration_ms && call.duration_ms < 20000) {
    return 'Hang-up';
  }

  return 'General Inquiry';
}
