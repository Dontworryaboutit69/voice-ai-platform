-- ===========================
-- SEED DATA
-- ===========================

-- Insert the Claude Project framework instructions
-- TODO: Replace the instructions below with your full 3,000+ word framework
INSERT INTO public.framework_instructions (
  name,
  version,
  instructions,
  sections_schema,
  quality_checklist,
  is_active
) VALUES (
  'retell_voice_ai_framework',
  'v1.0',
  $$
Production Voice AI Prompt Framework v3

You are an expert prompt generator for Retell AI voice agents. Your job is to create production-ready prompts that follow best practices for natural, conversational AI.

[TODO: PASTE YOUR FULL CLAUDE FRAMEWORK HERE - All 3,000+ words]

Key Requirements:
- Natural, conversational tone
- Stop after asking questions
- One question at a time
- SSML breaks included (.2s-.3s)
- Under token limit (2,600 words for outbound)
- 6-section structure: Role, Personality, Call Flow, Info Recap, Functions, Knowledge Base

$$,
  '{
    "role": {
      "description": "Agent identity and business context",
      "max_tokens": 400,
      "required_elements": ["business_name", "service_description", "agent_objective"]
    },
    "personality": {
      "description": "Conversational tone and style",
      "max_tokens": 300,
      "required_elements": ["tone", "communication_style", "empathy_guidelines"]
    },
    "call_flow": {
      "description": "Step-by-step conversation flow",
      "max_tokens": 800,
      "required_elements": ["greeting", "qualification_questions", "information_gathering", "next_steps"]
    },
    "info_recap": {
      "description": "How to summarize and confirm information",
      "max_tokens": 200,
      "required_elements": ["recap_format", "confirmation_pattern"]
    },
    "functions": {
      "description": "Custom functions the agent can call",
      "max_tokens": 400,
      "required_elements": []
    },
    "knowledge_base": {
      "description": "Business-specific information and FAQs",
      "max_tokens": 500,
      "required_elements": ["business_hours", "services", "pricing_info"]
    }
  }'::jsonb,
  '[
    "Natural, conversational tone maintained throughout",
    "Stops after asking questions (no continued talking)",
    "One question at a time pattern followed",
    "SSML breaks included for pacing (.2s-.3s)",
    "Under token limit for deployment",
    "All 6 sections properly structured",
    "No multiple questions in single turn",
    "Empathy shown when customer mentions problems",
    "Clear call-to-action or next steps provided"
  ]'::jsonb,
  true
);

-- Create a demo organization (for testing)
-- You can delete this after you have real users
INSERT INTO public.organizations (id, name, slug)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org');

-- Note: After running this migration, you'll need to:
-- 1. Create a user account via Supabase Auth
-- 2. Add that user to the organization_members table
-- 3. Then you can start creating agents
