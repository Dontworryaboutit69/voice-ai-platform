-- ===========================
-- 014: Dashboard Analytics Columns
-- ===========================
-- Adds dedicated columns for metrics that Retell provides
-- but were previously only stored in the call_analysis JSONB
-- (or discarded entirely). These first-class columns enable
-- fast per-agent dashboard aggregation.

-- Latency metrics (from Retell's latency.e2e object)
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS e2e_latency_p50 real;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS e2e_latency_p90 real;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS e2e_latency_p99 real;

-- Call termination & routing
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS disconnection_reason text;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS transfer_destination text;

-- Cost tracking (in cents for precision)
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS call_cost_cents real;

-- Promoted from call_analysis JSONB for fast aggregation
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS user_sentiment text;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS call_successful boolean;

-- Index for per-agent time-range dashboard queries
CREATE INDEX IF NOT EXISTS idx_calls_agent_started
  ON public.calls(agent_id, started_at DESC);
