-- Add missing integration types: calendly, cal_com, stripe
-- The original CHECK constraint in 011_integrations.sql only included 6 types

ALTER TABLE public.integration_connections
  DROP CONSTRAINT IF EXISTS integration_connections_integration_type_check;

ALTER TABLE public.integration_connections
  ADD CONSTRAINT integration_connections_integration_type_check
  CHECK (integration_type IN (
    'google_calendar',
    'gohighlevel',
    'zapier',
    'housecall_pro',
    'hubspot',
    'salesforce',
    'calendly',
    'cal_com',
    'stripe'
  ));

-- Fix oauth_states: allow NULL user_id (HubSpot OAuth may not have user context)
ALTER TABLE public.oauth_states ALTER COLUMN user_id DROP NOT NULL;
