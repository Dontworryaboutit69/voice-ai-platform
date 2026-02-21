import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CallRow {
  id: string;
  retell_call_id: string;
  from_number: string | null;
  to_number: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  call_status: string;
  call_successful: boolean | null;
  user_sentiment: string | null;
  e2e_latency_p50: number | null;
  transfer_destination: string | null;
  call_cost_cents: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRangeMs(range: string): number | null {
  switch (range) {
    case '7d':  return 7  * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    case '90d': return 90 * 24 * 60 * 60 * 1000;
    case 'all': return null;
    default:    return 30 * 24 * 60 * 60 * 1000;
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function computeStats(calls: CallRow[]) {
  const totalCalls = calls.length;

  // Average duration
  const withDuration = calls.filter(c => c.duration_ms != null);
  const avgDurationMs = withDuration.length > 0
    ? Math.round(withDuration.reduce((sum, c) => sum + (c.duration_ms || 0), 0) / withDuration.length)
    : 0;

  // Average latency (e2e p50)
  const withLatency = calls.filter(c => c.e2e_latency_p50 != null);
  const avgLatencyMs = withLatency.length > 0
    ? Math.round(withLatency.reduce((sum, c) => sum + (c.e2e_latency_p50 || 0), 0) / withLatency.length)
    : null;

  // Success rate (from call_successful boolean)
  const withSuccessData = calls.filter(c => c.call_successful != null);
  const successCount = withSuccessData.filter(c => c.call_successful === true).length;
  const successRate = withSuccessData.length > 0
    ? Math.round((successCount / withSuccessData.length) * 100)
    : (totalCalls > 0 ? 100 : 0); // Default to 100% if no analysis data yet

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0, unknown: 0 };
  for (const call of calls) {
    const s = (call.user_sentiment || '').toLowerCase();
    if (s === 'positive') sentimentBreakdown.positive++;
    else if (s === 'negative') sentimentBreakdown.negative++;
    else if (s === 'neutral') sentimentBreakdown.neutral++;
    else sentimentBreakdown.unknown++;
  }

  // Transfer rate
  const transferredCalls = calls.filter(c => c.transfer_destination != null && c.transfer_destination !== '');
  const transferRate = totalCalls > 0
    ? Math.round((transferredCalls.length / totalCalls) * 100)
    : 0;

  // Total talk minutes
  const totalDurationMs = calls.reduce((sum, c) => sum + (c.duration_ms || 0), 0);
  const totalTalkMinutes = Math.round(totalDurationMs / 60000);

  // Estimated cost based on per-minute pricing ($0.25/min)
  const COST_PER_MINUTE_CENTS = 25;
  const estimatedCostDollars = totalTalkMinutes > 0
    ? Math.round(totalTalkMinutes * COST_PER_MINUTE_CENTS) / 100
    : null;

  return {
    totalCalls,
    avgDurationMs,
    avgDurationFormatted: formatDuration(avgDurationMs),
    avgLatencyMs,
    successRate,
    sentimentBreakdown,
    transferRate,
    totalTalkMinutes,
    estimatedCostDollars,
  };
}

function computeChanges(
  currentStats: ReturnType<typeof computeStats>,
  prevStats: ReturnType<typeof computeStats>,
) {
  function pctChange(curr: number, prev: number): number | null {
    if (prev === 0) return curr > 0 ? 100 : null;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  }

  return {
    totalCalls: pctChange(currentStats.totalCalls, prevStats.totalCalls),
    avgDuration: pctChange(currentStats.avgDurationMs, prevStats.avgDurationMs),
    avgLatency: currentStats.avgLatencyMs != null && prevStats.avgLatencyMs != null
      ? pctChange(currentStats.avgLatencyMs, prevStats.avgLatencyMs)
      : null,
    successRate: pctChange(currentStats.successRate, prevStats.successRate),
    transferRate: pctChange(currentStats.transferRate, prevStats.transferRate),
  };
}

function buildCallVolume(calls: CallRow[], range: string) {
  // Group calls by date
  const countsByDate: Record<string, number> = {};

  for (const call of calls) {
    const date = new Date(call.started_at).toISOString().split('T')[0]; // YYYY-MM-DD
    countsByDate[date] = (countsByDate[date] || 0) + 1;
  }

  // Determine the full range of dates to include
  const rangeMs = getRangeMs(range);
  const now = new Date();
  const startDate = rangeMs ? new Date(now.getTime() - rangeMs) : null;

  // Generate all dates in range
  const volume: Array<{ date: string; count: number }> = [];
  const current = startDate ? new Date(startDate) : (calls.length > 0 ? new Date(calls[calls.length - 1].started_at) : new Date());
  current.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    volume.push({ date: dateStr, count: countsByDate[dateStr] || 0 });
    current.setDate(current.getDate() + 1);
  }

  return volume;
}

function buildDurationTrend(calls: CallRow[], range: string) {
  // Group avg duration by date for the line chart
  const durationsByDate: Record<string, number[]> = {};

  for (const call of calls) {
    if (call.duration_ms == null) continue;
    const date = new Date(call.started_at).toISOString().split('T')[0];
    if (!durationsByDate[date]) durationsByDate[date] = [];
    durationsByDate[date].push(call.duration_ms);
  }

  const rangeMs = getRangeMs(range);
  const now = new Date();
  const startDate = rangeMs ? new Date(now.getTime() - rangeMs) : null;

  const trend: Array<{ date: string; avgMs: number }> = [];
  const current = startDate ? new Date(startDate) : (calls.length > 0 ? new Date(calls[calls.length - 1].started_at) : new Date());
  current.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const durations = durationsByDate[dateStr];
    const avgMs = durations && durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : 0;
    trend.push({ date: dateStr, avgMs });
    current.setDate(current.getDate() + 1);
  }

  return trend;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const range = request.nextUrl.searchParams.get('range') || '30d';

    const supabase = createServiceClient();

    // Compute date ranges
    const now = new Date();
    const rangeMs = getRangeMs(range);
    const startDate = rangeMs ? new Date(now.getTime() - rangeMs).toISOString() : null;
    const prevStartDate = rangeMs ? new Date(now.getTime() - rangeMs * 2).toISOString() : null;

    // Fields we need from the calls table
    const selectFields = 'id, retell_call_id, from_number, to_number, started_at, ended_at, duration_ms, call_status, call_successful, user_sentiment, e2e_latency_p50, transfer_destination, call_cost_cents';

    // Build parallel queries — all scoped to this specific agent
    let currentQuery = supabase
      .from('calls')
      .select(selectFields)
      .eq('agent_id', agentId)
      .order('started_at', { ascending: false });

    if (startDate) {
      currentQuery = currentQuery.gte('started_at', startDate);
    }

    let prevQuery = null;
    if (prevStartDate && startDate) {
      prevQuery = supabase
        .from('calls')
        .select(selectFields)
        .eq('agent_id', agentId)
        .gte('started_at', prevStartDate)
        .lt('started_at', startDate)
        .order('started_at', { ascending: false });
    }

    // Execute in parallel
    const [currentResult, prevResult] = await Promise.all([
      currentQuery,
      prevQuery || Promise.resolve({ data: [], error: null }),
    ]);

    if (currentResult.error) {
      console.error('[dashboard] Error fetching current calls:', currentResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }

    const currentCalls = (currentResult.data || []) as CallRow[];
    const prevCalls = (prevResult.data || []) as CallRow[];

    // Compute stats
    const stats = computeStats(currentCalls);
    const prevStats = computeStats(prevCalls);
    const changes = range !== 'all' ? computeChanges(stats, prevStats) : {
      totalCalls: null,
      avgDuration: null,
      avgLatency: null,
      successRate: null,
      transferRate: null,
    };

    // Chart data
    const callVolume = buildCallVolume(currentCalls, range);
    const durationTrend = buildDurationTrend(currentCalls, range);

    // Recent calls (top 5)
    const recentCalls = currentCalls.slice(0, 5).map(c => ({
      id: c.id,
      retell_call_id: c.retell_call_id,
      from_number: c.from_number,
      started_at: c.started_at,
      duration_ms: c.duration_ms,
      call_status: c.call_status,
      user_sentiment: c.user_sentiment,
      call_successful: c.call_successful,
    }));

    return NextResponse.json({
      success: true,
      stats,
      changes,
      callVolume,
      durationTrend,
      recentCalls,
    });
  } catch (error: any) {
    console.error('[dashboard] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
