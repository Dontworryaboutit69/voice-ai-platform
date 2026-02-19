-- Add transfer configuration columns to agents table
-- These persist the transfer settings from onboarding so they can be
-- viewed/edited later and survive Retell agent recreation.

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS transfer_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS transfer_number text,
  ADD COLUMN IF NOT EXISTS transfer_person_name text,
  ADD COLUMN IF NOT EXISTS transfer_triggers text[] DEFAULT '{}';
