# AI Manager - Setup Complete! 🎉

## What Was Built

An AI Manager system that automatically evaluates production calls, detects patterns, and suggests prompt improvements.

## 🎯 Features

### 1. **Automatic Call Evaluation**
- Evaluates each call after it completes (via webhook)
- Filters non-interactive calls (<20s, hang-ups, no real conversation)
- Scores calls on 5 dimensions: Quality, Empathy, Professionalism, Efficiency, Goal Achievement
- Detects specific issues with examples and turn numbers
- Identifies missed opportunities

### 2. **Pattern Detection**
- Analyzes recent calls to find recurring issues
- Only suggests when pattern appears in **3+ calls**
- Tracks frequency and severity of each pattern
- Stores historical pattern analysis

### 3. **Improvement Suggestions**
- Auto-generates specific prompt modifications using Claude API
- Shows which sections to update and exact text to add
- Includes confidence score and impact estimate
- **All suggestions require human approval** (no auto-apply)

### 4. **API Integration**
- Real-time evaluation after each call (non-blocking webhook)
- Manual pattern analysis trigger
- Suggestion approval workflow
- Get evaluations and suggestions via API

## 📁 Files Created

### Database
1. `/supabase/migrations/009_ai_manager.sql` - Database schema
   - `ai_call_evaluations` table
   - `ai_improvement_suggestions` table
   - `ai_pattern_analysis` table
   - RLS policies for security
   - Indexes for performance

### Services
2. `/lib/services/ai-manager.service.ts` - Core evaluation logic
   - `evaluateCall(callId)` - Evaluates single call using Claude API
   - `isCallInteractive(call)` - Filters non-interactive calls
   - `analyzePatterns(agentId, daysSince)` - Batch pattern analysis
   - `detectPatterns(evaluations)` - Groups issues by type

3. `/lib/services/improvement-suggestion.service.ts` - Suggestion generation
   - `generateImprovementSuggestion()` - Creates suggestions using Claude API
   - `applySuggestion()` - Applies accepted suggestions to create new prompt versions

### API Routes
4. `/app/api/agents/[agentId]/ai-manager/suggestions/route.ts`
   - `GET` - List suggestions (filter by status)
   - `POST` - Accept or reject suggestions

5. `/app/api/agents/[agentId]/ai-manager/analyze/route.ts`
   - `GET` - Get recent pattern analysis results
   - `POST` - Manually trigger pattern analysis

6. `/app/api/agents/[agentId]/ai-manager/evaluations/route.ts`
   - `GET` - Get call evaluations with call details

### Modified Files
7. `/app/api/webhooks/retell/call-events/route.ts`
   - Added `evaluateCallAsync()` to trigger evaluation after each call
   - Non-blocking async execution

## 🚀 Next Steps

### 1. Run the Database Migration ⚠️

**Option A: Supabase SQL Editor (Easiest)**
1. Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new
2. Copy all SQL from `/Users/kylekotecha/Desktop/voice-ai-platform/supabase/migrations/009_ai_manager.sql`
3. Paste and click "Run"

**Option B: Using Supabase CLI**
```bash
supabase migration up
```

### 2. Test the System

#### Test Per-Call Evaluation
1. Make 5 test calls to an agent:
   - 2 short calls (<20s, should be filtered)
   - 3 real conversations (>30s with back-and-forth)
2. Check database:
   ```sql
   SELECT * FROM ai_call_evaluations ORDER BY created_at DESC LIMIT 10;
   ```
3. Verify only 3 calls have evaluation records
4. Check scores are populated (0.0-1.0 range)
5. Verify `issues_detected` array has specific examples

#### Test Pattern Detection
1. Make 4 calls with same issue (e.g., agent asks multiple questions per turn)
2. Trigger pattern analysis:
   ```bash
   curl -X POST http://localhost:3000/api/agents/AGENT_ID/ai-manager/analyze \
     -H "Content-Type: application/json" \
     -d '{"daysSince": 7}'
   ```
3. Check database for suggestions:
   ```sql
   SELECT * FROM ai_improvement_suggestions WHERE agent_id = 'AGENT_ID';
   ```
4. Verify suggestion created ONLY after 3rd occurrence
5. Verify status is 'pending'

#### Test Suggestion Approval
1. Get pending suggestions:
   ```bash
   curl http://localhost:3000/api/agents/AGENT_ID/ai-manager/suggestions?status=pending
   ```
2. Accept a suggestion:
   ```bash
   curl -X POST http://localhost:3000/api/agents/AGENT_ID/ai-manager/suggestions \
     -H "Content-Type: application/json" \
     -d '{
       "suggestionId": "SUGGESTION_ID",
       "action": "accept",
       "userId": "USER_ID"
     }'
   ```
3. Verify new prompt version created:
   ```sql
   SELECT * FROM prompt_versions WHERE agent_id = 'AGENT_ID' ORDER BY version_number DESC LIMIT 1;
   ```

### 3. Build the UI (Next Phase)

The backend is complete. Now you need to build the frontend:

**Components Needed:**
1. `AIManagerDashboard.tsx` - Main dashboard with tabs
2. `SuggestionCard.tsx` - Display suggestion with accept/reject buttons
3. `CallEvaluationCard.tsx` - Show evaluation scores and issues
4. `PatternChart.tsx` - Visualize patterns over time

**Integration Points:**
- Add "AI Manager" tab to agent dashboard page
- Fetch suggestions: `GET /api/agents/[agentId]/ai-manager/suggestions?status=pending`
- Accept suggestion: `POST /api/agents/[agentId]/ai-manager/suggestions` with action='accept'
- Fetch evaluations: `GET /api/agents/[agentId]/ai-manager/evaluations`

### 4. Set Up Background Job (Optional but Recommended)

**Option 1: Vercel Cron**
Create `/app/api/cron/analyze-patterns/route.ts`:
```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all active agents and analyze patterns
  const { data: agents } = await supabase
    .from('agents')
    .select('id')
    .eq('status', 'active');

  for (const agent of agents) {
    await analyzePatterns(agent.id, 7);
  }

  return Response.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/analyze-patterns",
    "schedule": "0 2 * * *"
  }]
}
```

**Option 2: Manual Trigger**
Add button in UI to trigger analysis on-demand

## 🔧 How It Works

### User Flow

1. **Call Happens**
   - Customer calls agent's phone number
   - Retell handles the call
   - Call ends

2. **Automatic Evaluation** (Real-Time)
   - Webhook fires: `call_ended` event
   - System checks if call is interactive (>20s, real conversation)
   - If yes: Claude API evaluates the call
   - Stores evaluation in database
   - Webhook responds immediately (non-blocking)

3. **Pattern Detection** (Nightly or On-Demand)
   - System analyzes last 7 days of evaluations
   - Groups issues by type
   - Counts occurrences
   - If pattern appears 3+ times → Generate suggestion

4. **Suggestion Generation**
   - Claude API analyzes pattern + call transcripts
   - Generates specific prompt modifications
   - Calculates confidence score and impact
   - Stores suggestion with status='pending'

5. **Human Approval** (In Dashboard)
   - User sees pending suggestion
   - Reviews example calls showing the issue
   - Reviews proposed changes (before/after)
   - Clicks "Accept" or "Reject"

6. **Apply Changes** (If Accepted)
   - System creates new prompt version
   - Applies modifications to relevant sections
   - Updates agent's current_prompt_id
   - Marks suggestion as 'accepted'

### Technical Stack
- **Database**: Supabase PostgreSQL with RLS
- **AI Analysis**: Claude Sonnet 3.5 via Anthropic API
- **Webhooks**: Retell call lifecycle events
- **API**: Next.js API routes
- **Background Jobs**: Vercel Cron (optional)

## 💡 Key Design Decisions

1. **No Auto-Apply**
   - All suggestions require human approval
   - Status always defaults to 'pending'
   - User has full control

2. **3+ Occurrence Threshold**
   - Prevents noise from single bad calls
   - Only suggests when pattern is recurring
   - Configurable per agent (future enhancement)

3. **Non-Interactive Call Filter**
   - Ignores hang-ups (<20s)
   - Ignores calls with no real conversation
   - Saves API costs
   - Focuses on meaningful interactions

4. **Async Evaluation**
   - Doesn't block webhook response
   - Retell gets immediate 200 OK
   - Evaluation happens in background

5. **Pattern-Based Suggestions**
   - Not just single-call feedback
   - Looks for systemic issues
   - Data-driven improvements

## 📊 Database Schema

```sql
ai_call_evaluations
├── id (uuid, PK)
├── call_id (uuid, FK → calls.id)
├── agent_id (uuid, FK → agents.id)
├── quality_score (0.0-1.0)
├── empathy_score (0.0-1.0)
├── professionalism_score (0.0-1.0)
├── efficiency_score (0.0-1.0)
├── goal_achievement_score (0.0-1.0)
├── issues_detected (jsonb array)
├── opportunities (jsonb array)
├── summary_analysis (text)
└── created_at (timestamptz)

ai_improvement_suggestions
├── id (uuid, PK)
├── agent_id (uuid, FK → agents.id)
├── source_type ('pattern_analysis' | 'batch_evaluation')
├── source_call_ids (uuid array)
├── title (text)
├── description (text)
├── proposed_changes (jsonb)
├── confidence_score (0.0-1.0)
├── impact_estimate ('low' | 'medium' | 'high')
├── status ('pending' | 'accepted' | 'rejected')
├── reviewed_at (timestamptz)
├── reviewed_by (uuid, FK → users.id)
├── applied_to_version_id (uuid, FK → prompt_versions.id)
└── created_at (timestamptz)

ai_pattern_analysis
├── id (uuid, PK)
├── agent_id (uuid, FK → agents.id)
├── analysis_period_start (timestamptz)
├── analysis_period_end (timestamptz)
├── total_calls_analyzed (integer)
├── patterns (jsonb array)
├── avg_quality_score (real)
└── created_at (timestamptz)
```

## 🔒 Security

- **RLS Policies**: Users can only access their org's data
- **API Key Protection**: Claude API key in environment variable
- **Webhook Validation**: Retell signature verification
- **User Authentication**: Supabase auth for all operations

## 🐛 Troubleshooting

**Issue: Evaluations not being created**
- Check webhook is firing: Look for logs in `/api/webhooks/retell/call-events`
- Verify call duration: Must be >20 seconds
- Check transcript: Must have content
- Look for errors in server logs

**Issue: No suggestions generated**
- Verify pattern appears 3+ times
- Check severity is not 'low'
- Run manual analysis: `POST /api/agents/[agentId]/ai-manager/analyze`
- Check pattern analysis table for results

**Issue: Suggestion acceptance fails**
- Verify suggestion status is 'pending'
- Check agent has current_prompt_id set
- Look for errors in apply suggestion logic
- Verify user has permission

## 📝 Notes

- Evaluations happen automatically after each call (no manual trigger needed for individual calls)
- Pattern analysis runs nightly via cron OR can be triggered manually
- Claude API costs: ~$0.01 per evaluation, ~$0.02 per suggestion
- First suggestion appears after 3rd call with same issue
- Suggestions include exact prompt modifications (not vague recommendations)

---

This system will dramatically improve your agents over time by learning from real call data. The more calls, the better the suggestions!
