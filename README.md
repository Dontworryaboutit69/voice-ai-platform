# Voice AI Platform

A DIY platform for creating production-ready voice AI agents powered by Retell AI and Claude.

## What This Platform Does

1. **Onboarding**: Users fill out a business details form (or connect Google Business Profile)
2. **Prompt Generation**: AI generates a production-ready voice agent prompt using your proven framework
3. **Testing**: Users test via text or voice role-play, give conversational feedback
4. **Auto-Improvement**: Platform automatically updates prompts based on user feedback
5. **Activation**: Users purchase phone number and go live
6. **Call Tracking**: Dashboard shows all calls, transcripts, and analytics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + RLS)
- **Voice**: Retell AI (voice infrastructure)
- **AI**: Claude Sonnet 4.5 (prompt generation, improvements)
- **Hosting**: Vercel (recommended)

## Project Structure

```
voice-ai-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── onboarding/           # Agent creation wizard
│   │   ├── agents/[agentId]/     # Agent management
│   │   │   ├── prompt/           # Prompt Studio
│   │   │   ├── test/             # Role-play testing
│   │   │   ├── calls/            # Call history
│   │   │   └── analytics/        # Usage analytics
│   │   └── billing/              # Subscription management
│   └── api/                      # API routes
│       └── agents/[agentId]/     # Agent-specific endpoints
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   └── services/                 # Business logic
│       ├── prompt-generator.service.ts
│       ├── prompt-improvement.service.ts
│       └── deployment/
├── components/                   # React components
│   ├── onboarding/               # Onboarding form
│   ├── prompt-studio/            # Prompt editor
│   ├── role-play/                # Testing interface
│   └── dashboard/                # Analytics & tracking
└── supabase/
    ├── migrations/               # Database schema
    └── seed.sql                  # Initial data
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.local` and fill in your actual keys:

```bash
# Supabase (from https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://qoendwnzpsmztgonrxzq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Claude API (from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your-claude-api-key-here

# Retell AI (from https://retellai.com/dashboard)
RETELL_API_KEY=your-retell-api-key-here
```

### 2. Database Setup

Run the migration in Supabase:

1. Go to https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/editor
2. Click "SQL Editor"
3. Copy the contents of `supabase/migrations/001_core_schema.sql`
4. Paste and run

Then run the seed file:

1. Copy contents of `supabase/seed.sql`
2. **Replace the TODO section with your full Claude framework** (3,000+ words)
3. Paste and run in SQL Editor

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Database Schema

### Core Tables

- **organizations**: Multi-tenant organization accounts
- **organization_members**: User membership and roles
- **agents**: Voice AI agents (one per business)
- **prompt_versions**: Version-controlled prompts (6-section structure)
- **test_conversations**: Role-play testing sessions
- **prompt_improvements**: Feedback → improvement tracking
- **calls**: Production call records
- **framework_instructions**: Your Claude framework (stored in DB)

### Row-Level Security (RLS)

All tables have RLS policies to ensure:
- Users only see data for their organizations
- Multi-tenant data isolation
- Secure by default

## Key Features to Build

### Phase 1: Foundation (Weeks 1-3)
- [x] Next.js project setup
- [x] Supabase configuration
- [x] Database schema
- [ ] Onboarding form component
- [ ] Claude API integration for prompt generation
- [ ] Prompt Studio UI

### Phase 2: Testing & Feedback (Weeks 4-6)
- [ ] Text-based role-play interface
- [ ] Real-time issue detection
- [ ] Conversational feedback processing
- [ ] Auto-improvement pipeline
- [ ] Change preview UI

### Phase 3: Voice & Activation (Weeks 7-9)
- [ ] Voice testing via Retell Web SDK
- [ ] Phone number provisioning
- [ ] Webhook handlers for calls
- [ ] Call recording & transcripts
- [ ] Call history view

### Phase 4: Analytics (Weeks 10-12)
- [ ] Usage tracking
- [ ] Analytics dashboard
- [ ] Call outcome analysis

## Next Steps

1. **Get your Supabase API keys** from the settings page
2. **Add your Claude API key** to `.env.local`
3. **Run the database migrations** in Supabase SQL Editor
4. **Update seed.sql** with your full Claude framework
5. **Start building the onboarding form**

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Get preview URL immediately
```

Every git push will auto-deploy a preview URL.

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Retell AI Docs](https://docs.retellai.com/)
- [Claude API Docs](https://docs.anthropic.com/)
- [Implementation Plan](/.claude/plans/concurrent-foraging-dongarra.md)

## Support

Built with Claude Code by Kyle Kotecha
