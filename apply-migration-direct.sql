-- Add webhook_token column for CRM webhook integration
-- Copy this SQL and run it in Supabase Dashboard > SQL Editor

BEGIN;

-- Add webhook_token column to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS webhook_token TEXT UNIQUE;

-- Add index for faster webhook token lookups
CREATE INDEX IF NOT EXISTS idx_agents_webhook_token ON public.agents(webhook_token);

-- Verify the column was added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name = 'webhook_token';

COMMIT;

-- Expected output: Should show webhook_token column with type 'text' and nullable = YES
