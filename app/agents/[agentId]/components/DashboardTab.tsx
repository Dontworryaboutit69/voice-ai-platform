'use client';

import { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalCalls: number;
  avgDurationMs: number;
  avgDurationFormatted: string;
  avgLatencyMs: number | null;
  successRate: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    unknown: number;
  };
  transferRate: number;
  totalTalkMinutes: number;
  estimatedCostDollars: number | null;
}

interface DashboardChanges {
  totalCalls: number | null;
  avgDuration: number | null;
  avgLatency: number | null;
  successRate: number | null;
  transferRate: number | null;
}

interface CallVolumePoint {
  date: string;
  count: number;
}

interface DurationTrendPoint {
  date: string;
  avgMs: number;
}

interface RecentCall {
  id: string;
  retell_call_id: string;
  from_number: string | null;
  started_at: string;
  duration_ms: number | null;
  call_status: string;
  user_sentiment: string | null;
  call_successful: boolean | null;
}

type Range = '7d' | '30d' | '90d' | 'all';

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatChange(value: number | null): { text: string; isPositive: boolean } | null {
  if (value == null) return null;
  const sign = value >= 0 ? '+' : '';
  return {
    text: `${sign}${value}%`,
    isPositive: value >= 0,
  };
}

function getDominantSentiment(breakdown: DashboardStats['sentimentBreakdown']): {
  label: string;
  emoji: string;
  color: string;
} {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative + breakdown.unknown;
  if (total === 0) return { label: 'No data', emoji: '—', color: '#9CA3AF' };

  if (breakdown.positive >= breakdown.neutral && breakdown.positive >= breakdown.negative) {
    return { label: 'Positive', emoji: '😊', color: '#10B981' };
  }
  if (breakdown.negative >= breakdown.positive && breakdown.negative >= breakdown.neutral) {
    return { label: 'Negative', emoji: '😞', color: '#EF4444' };
  }
  return { label: 'Neutral', emoji: '😐', color: '#F59E0B' };
}

function getCallerInitial(fromNumber: string | null): string {
  if (!fromNumber) return '?';
  const clean = fromNumber.replace(/\D/g, '');
  return clean.length > 0 ? clean[clean.length - 1] : '?';
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return 'Unknown Caller';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean[0] === '1') {
    return `(${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

function formatDurationFromMs(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ─── Sparkline SVG (decorative) ──────────────────────────────────────────────

function Sparkline({ color }: { color: string }) {
  return (
    <svg className="w-full h-8 mt-3" viewBox="0 0 100 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,25 Q15,20 25,18 T50,12 T75,8 T100,5 V30 H0 Z"
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <path
        d="M0,25 Q15,20 25,18 T50,12 T75,8 T100,5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  color,
  suffix,
}: {
  label: string;
  value: string;
  change: { text: string; isPositive: boolean } | null;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 bg-white border border-gray-200 shadow-sm">
      <div className="h-1" style={{ background: color }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          {change && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${color}0F`,
                color: change.isPositive ? '#10B981' : '#EF4444',
              }}
            >
              {change.text}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {suffix && <span className="text-sm font-medium text-gray-400 ml-1">{suffix}</span>}
        </p>
        <Sparkline color={color} />
      </div>
    </div>
  );
}

// ─── Donut / Pie Chart (SVG) ─────────────────────────────────────────────────

function SentimentDonut({ breakdown }: { breakdown: DashboardStats['sentimentBreakdown'] }) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative + breakdown.unknown;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="60" fill="none" stroke="#F3F4F6" strokeWidth="20" />
        </svg>
        <p className="text-sm text-gray-400 mt-2">No sentiment data</p>
      </div>
    );
  }

  const segments = [
    { label: 'Positive', count: breakdown.positive, color: '#10B981' },
    { label: 'Neutral', count: breakdown.neutral, color: '#F59E0B' },
    { label: 'Negative', count: breakdown.negative, color: '#EF4444' },
    { label: 'Unknown', count: breakdown.unknown, color: '#D1D5DB' },
  ].filter(s => s.count > 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((seg) => {
            const pct = seg.count / total;
            const dashLen = pct * circumference;
            const dashGap = circumference - dashLen;
            const currentOffset = offset;
            offset += dashLen;
            return (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="20"
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeDashoffset={-currentOffset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-[10px] text-gray-400">total</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-[11px] text-gray-600">
              {seg.label} <span className="font-semibold">{Math.round((seg.count / total) * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Line Chart (SVG) ────────────────────────────────────────────────────────

function DurationLineChart({ data }: { data: DurationTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No duration data for this period
      </div>
    );
  }

  // Filter out trailing zeros for cleaner chart
  const nonZeroData = data.filter(d => d.avgMs > 0);
  if (nonZeroData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No duration data for this period
      </div>
    );
  }

  const chartW = 500;
  const chartH = 160;
  const padTop = 10;
  const padBottom = 30;
  const padLeft = 45;
  const padRight = 10;
  const drawW = chartW - padLeft - padRight;
  const drawH = chartH - padTop - padBottom;

  const maxMs = Math.max(...data.map(d => d.avgMs), 1);
  // Round up to nice number for y-axis
  const yMax = Math.ceil(maxMs / 10000) * 10000 || 60000;

  function toX(i: number): number {
    return padLeft + (i / Math.max(data.length - 1, 1)) * drawW;
  }
  function toY(ms: number): number {
    return padTop + drawH - (ms / yMax) * drawH;
  }

  // Build path
  const points = data.map((d, i) => `${toX(i)},${toY(d.avgMs)}`);
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${toX(data.length - 1)},${padTop + drawH} L${toX(0)},${padTop + drawH} Z`;

  // Y-axis labels (3 ticks)
  const yTicks = [0, yMax / 2, yMax];

  // X-axis labels (show ~5 labels max)
  const xStep = Math.max(Math.floor(data.length / 5), 1);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="line-area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={padLeft}
          y1={toY(tick)}
          x2={chartW - padRight}
          y2={toY(tick)}
          stroke="#F3F4F6"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={padLeft - 6}
          y={toY(tick) + 3}
          textAnchor="end"
          fontSize="9"
          fill="#9CA3AF"
        >
          {formatDurationFromMs(tick)}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#line-area-gradient)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data dots (only on non-zero days) */}
      {data.map((d, i) =>
        d.avgMs > 0 ? (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.avgMs)}
            r="3"
            fill="#8B5CF6"
            stroke="white"
            strokeWidth="1.5"
          />
        ) : null,
      )}

      {/* X-axis labels */}
      {data.map((d, i) =>
        i % xStep === 0 || i === data.length - 1 ? (
          <text
            key={`x-${i}`}
            x={toX(i)}
            y={chartH - 5}
            textAnchor="middle"
            fontSize="9"
            fill="#9CA3AF"
          >
            {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </text>
        ) : null,
      )}
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface DashboardTabProps {
  agentId: string;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardTab({ agentId, onNavigateToTab }: DashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [changes, setChanges] = useState<DashboardChanges | null>(null);
  const [callVolume, setCallVolume] = useState<CallVolumePoint[]>([]);
  const [durationTrend, setDurationTrend] = useState<DurationTrendPoint[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('30d');

  useEffect(() => {
    loadDashboard();
  }, [agentId, range]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/agents/${agentId}/dashboard?range=${range}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setChanges(data.changes);
        setCallVolume(data.callVolume);
        setDurationTrend(data.durationTrend || []);
        setRecentCalls(data.recentCalls);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error loading dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Loading skeleton ───

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="col-span-2 h-64 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 h-64 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ─── Error state ───

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // ─── Computed display values ───

  const sentiment = getDominantSentiment(stats.sentimentBreakdown);
  const lastCallTime = recentCalls.length > 0 ? timeAgo(recentCalls[0].started_at) : 'No calls yet';
  const maxVolume = Math.max(...callVolume.map(d => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-gray-500 text-sm">Performance overview for this agent</p>
      </div>

      {/* Status bar + range toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Agent Active</span>
          </div>
          <span className="text-xs text-gray-400">Last call: {lastCallTime}</span>
        </div>

        {/* Range toggle */}
        <div className="flex gap-1 rounded-lg p-0.5 bg-gray-100">
          {([
            { value: '7d', label: 'Week' },
            { value: '30d', label: 'Month' },
            { value: '90d', label: 'Quarter' },
            { value: 'all', label: 'All' },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                range === item.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Total Calls"
          value={stats.totalCalls.toLocaleString()}
          change={formatChange(changes?.totalCalls ?? null)}
          color="#635BFF"
        />
        <StatCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          change={formatChange(changes?.successRate ?? null)}
          color="#10B981"
        />
        <StatCard
          label="Avg Duration"
          value={stats.avgDurationFormatted}
          change={formatChange(changes?.avgDuration ?? null)}
          color="#F59E0B"
        />
        <StatCard
          label="Avg Latency"
          value={stats.avgLatencyMs != null ? `${stats.avgLatencyMs}` : '—'}
          change={formatChange(changes?.avgLatency ?? null)}
          color="#8B5CF6"
          suffix={stats.avgLatencyMs != null ? 'ms' : undefined}
        />
        <StatCard
          label="User Sentiment"
          value={`${sentiment.emoji} ${sentiment.label}`}
          change={null}
          color="#3B82F6"
        />
        <StatCard
          label="Talk Minutes"
          value={stats.totalTalkMinutes.toLocaleString()}
          change={null}
          color="#EF4444"
          suffix={stats.estimatedCostDollars != null ? `~$${stats.estimatedCostDollars.toFixed(2)}` : 'min'}
        />
      </div>

      {/* Transfer rate bar */}
      <div className="mb-6 flex items-center gap-4 px-5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
        <span className="text-xs font-medium text-gray-500">Transfer Rate</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(stats.transferRate, 100)}%`,
              background: 'linear-gradient(90deg, #635BFF, #8B5CF6)',
            }}
          />
        </div>
        <span className="text-sm font-bold text-gray-900">{stats.transferRate}%</span>
      </div>

      {/* Row 1: Call Volume Bar Chart + Sentiment Donut */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Call Volume Chart */}
        <div className="col-span-2 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Call Volume</p>
              <p className="text-xs mt-0.5 text-gray-500">Calls handled over time</p>
            </div>
          </div>

          {callVolume.length > 0 ? (
            <div className="h-48 flex items-end gap-1 px-1">
              {callVolume.map((day, i) => {
                const heightPct = maxVolume > 0 ? (day.count / maxVolume) * 100 : 0;
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isLast = i === callVolume.length - 1;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {day.count} call{day.count !== 1 ? 's' : ''} &middot;{' '}
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div
                      className="w-full rounded-lg transition-all duration-300"
                      style={{
                        height: `${Math.max(heightPct * 1.8, day.count > 0 ? 4 : 1)}px`,
                        maxHeight: '180px',
                        background:
                          isLast || isToday
                            ? 'linear-gradient(180deg, #635BFF, #8B5CF6)'
                            : '#EEEEF4',
                        boxShadow:
                          isLast || isToday
                            ? '0 4px 12px rgba(99, 91, 255, 0.25)'
                            : 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No call data for this period
            </div>
          )}
        </div>

        {/* Sentiment Donut Chart */}
        <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900">Sentiment Breakdown</p>
            <p className="text-xs mt-0.5 text-gray-500">How callers feel</p>
          </div>
          <SentimentDonut breakdown={stats.sentimentBreakdown} />
        </div>
      </div>

      {/* Row 2: Duration Trend Line Chart + Recent Calls */}
      <div className="grid grid-cols-3 gap-5">
        {/* Duration Trend Line Chart */}
        <div className="col-span-2 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Avg Duration Trend</p>
              <p className="text-xs mt-0.5 text-gray-500">Average call duration over time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-[3px] rounded-full bg-violet-500" />
              <span className="text-[10px] text-gray-400">Avg duration</span>
            </div>
          </div>
          <div className="h-48">
            <DurationLineChart data={durationTrend} />
          </div>
        </div>

        {/* Recent Calls Panel */}
        <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-900">Recent Calls</p>
            <button
              onClick={() => onNavigateToTab('calls')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all &rarr;
            </button>
          </div>

          {recentCalls.length > 0 ? (
            <div className="space-y-3">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-100 text-gray-500">
                      {getCallerInitial(call.from_number)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPhoneNumber(call.from_number)}
                      </p>
                      <p className="text-[11px] text-gray-400">{timeAgo(call.started_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: call.call_status === 'completed' ? '#10B981' : '#EF4444',
                      }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        color: call.call_status === 'completed' ? '#10B981' : '#EF4444',
                      }}
                    >
                      {call.call_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📞</p>
              <p className="text-sm text-gray-400">No calls yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Calls will appear here once your agent takes calls
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
