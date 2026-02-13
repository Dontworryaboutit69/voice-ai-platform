# Weekly Optimization System

## Overview

The Weekly Optimization System automatically analyzes your voice AI agent's performance each week, identifies improvement opportunities, and proposes optimizations—all powered by Claude Sonnet 4.5.

## How It Works

### 1. **Weekly Analysis** (Automated)
Every Monday at 2 AM, the system:
- Analyzes last week's call transcripts (minimum 10 calls required)
- Identifies common issues (must appear in 3+ calls with 60%+ impact score)
- Detects success patterns
- Calculates performance metrics (sentiment, conversion, duration)

### 2. **Improvement Generation** (AI-Powered)
When significant issues are found:
- Claude analyzes the issues and current prompt
- Generates specific, targeted improvements
- Preserves what's working well
- Creates expected improvement estimates

### 3. **User Notification** (Email)
You receive an email with:
- Performance summary (calls, sentiment, conversion)
- What's working great
- Areas for improvement with specific examples
- Proposed changes and expected impact
- Action buttons (Accept, Customize, Skip)

### 4. **A/B Testing** (Automated)
When you accept improvements:
- New prompt version created
- A/B test runs for 7 days
- 75% of calls use current version (control)
- 25% of calls use new version (test)
- Tracks sentiment, conversion, duration for both

### 5. **Evaluation & Promotion** (Automated)
After 7 days:
- System compares test vs control performance
- If test version improves both sentiment AND conversion → promoted
- If test underperforms → control stays active
- You receive email with results and decision

## Database Schema

### `agent_optimizations` Table
Stores weekly optimization proposals and results.

**Key Fields:**
- `analysis_period_start/end` - Week being analyzed
- `calls_analyzed` - Number of calls reviewed
- `common_issues` - JSON array of detected issues
- `success_patterns` - JSON array of what's working
- `proposed_prompt_version_id` - Link to new version
- `status` - pending | accepted | rejected | ab_testing | completed | skipped

### `ab_tests` Table
Tracks A/B test configuration and results.

**Key Fields:**
- `control_version_id` - Current prompt
- `test_version_id` - Proposed improved prompt
- `traffic_split_control/test` - Traffic percentage (75/25)
- `control/test_avg_sentiment` - Performance metrics
- `winner` - control | test | inconclusive

### Enhanced `calls` Table
Added fields for A/B testing:
- `prompt_version_id` - Which version was used
- `ab_test_id` - Which test it's part of
- `sentiment_score` - 0.0-1.0 rating
- `conversion_successful` - Boolean goal achievement

## API Endpoints

### POST /api/optimize/analyze
Triggers analysis for an agent.

**Request:**
```json
{
  "agent_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": { ... },
  "improvements": { ... },
  "optimization": { ... },
  "newPromptVersion": { ... }
}
```

### POST /api/optimize/[id]/accept
Accepts optimization and starts A/B test.

**Response:**
```json
{
  "success": true,
  "abTest": { ... },
  "testDuration": 7
}
```

### POST /api/optimize/[id]/reject
Rejects optimization with optional feedback.

**Request:**
```json
{
  "feedback": "Not the right approach"
}
```

### GET /api/optimize/[id]
Get optimization details.

### PUT /api/optimize/[id]
Update optimization with custom feedback/changes.

**Request:**
```json
{
  "customFeedback": "Make it more assertive",
  "customPromptChanges": "Updated prompt text..."
}
```

### POST /api/optimize/ab-test/[id]/evaluate
Evaluates A/B test and promotes winner.

**Response:**
```json
{
  "success": true,
  "winner": "test",
  "promoted": true,
  "controlMetrics": { ... },
  "testMetrics": { ... },
  "improvements": {
    "sentiment": "+8.5%",
    "conversion": "+12.3%",
    "duration": "-15s"
  }
}
```

## Core Services

### `optimization-analyzer.service.ts`

**analyzeCallsForOptimization(calls, currentPrompt)**
- Analyzes array of calls with Claude API
- Returns: sentiment, conversion, issues, patterns, scores

**generateImprovements(analysis, currentPrompt)**
- Takes analysis results and generates improvements
- Returns: changeSummary, proposedChanges, expectedImprovements

**hasSignificantIssues(analysis)**
- Checks if issues meet threshold (3+ frequency, 0.6+ impact)
- Returns: boolean

## Email Templates (To Build)

### Weekly Report - No Changes Needed
Subject: "Your AI Agent Had a Great Week! 📊"
- Performance summary
- What's working well
- No action needed

### Weekly Report - Improvements Found
Subject: "Your AI Agent Analyzed 47 Calls - 2 Improvements Found"
- Full performance breakdown
- Issues with examples
- What's working
- Proposed changes
- Action buttons

### A/B Test Started
Subject: "Your Agent Optimization is Now Testing"
- Test configuration
- What to expect
- How to monitor

### A/B Test Complete - Success
Subject: "Great News! Your Agent Just Got Better 🎉"
- Performance improvements
- What changed
- New version now live

### A/B Test Complete - No Change
Subject: "A/B Test Complete - Keeping Current Version"
- Why control was kept
- What was learned

## Setup Instructions

### 1. Run Database Migration
Open Supabase SQL Editor and run:
```sql
-- Contents of supabase/migrations/004_weekly_optimization.sql
```

### 2. Verify Tables Created
Check that these tables exist:
- `agent_optimizations`
- `ab_tests`
- `calls` (with new columns)

### 3. Test API Endpoints
```bash
# Test analysis endpoint
curl -X POST http://localhost:3000/api/optimize/analyze \
  -H 'Content-Type: application/json' \
  -d '{"agent_id":"YOUR_AGENT_ID"}'
```

### 4. Setup Cron Job (Future)
Will be configured to run weekly analysis automatically.

## Testing

### Run Verification Script
```bash
./scripts/verify-optimization.sh
```

This checks:
- Dev server is running
- All files exist
- Migration is ready
- All API routes are available

### Manual Testing Flow
1. Create test agent with 10+ calls
2. Run analysis: `POST /api/optimize/analyze`
3. Get optimization ID from response
4. Accept optimization: `POST /api/optimize/[id]/accept`
5. Verify A/B test created
6. Simulate calls with different versions
7. Evaluate test: `POST /api/optimize/ab-test/[id]/evaluate`
8. Verify winner promoted

## Key Features

✅ **Fully Automated** - Runs weekly without manual intervention
✅ **AI-Powered** - Claude Sonnet 4.5 analyzes and improves
✅ **Safe Testing** - A/B tests with 75/25 split
✅ **Threshold-Based** - Only acts on significant, recurring issues
✅ **User Controlled** - Accept, reject, or customize before applying
✅ **Email Notifications** - Clear, actionable emails at each step
✅ **Performance Tracking** - Detailed metrics comparison
✅ **Reversible** - Can rollback if test doesn't improve

## Future Enhancements

- [ ] Email notification system integration
- [ ] Dashboard UI for viewing optimizations
- [ ] Slack notifications option
- [ ] Custom analysis frequency (weekly, bi-weekly, monthly)
- [ ] Issue categorization (urgency, questions, tone, etc.)
- [ ] Multi-variant testing (A/B/C)
- [ ] Manual trigger option in UI
- [ ] Export optimization reports
- [ ] Custom success criteria per agent

## Troubleshooting

**Issue:** "Not enough calls to analyze"
- Solution: Need minimum 10 calls in last 7 days

**Issue:** "No significant issues found"
- Solution: Issues must appear in 3+ calls with 0.6+ impact score

**Issue:** "A/B test has insufficient data"
- Solution: Need calls on both versions to evaluate

**Issue:** "Sentiment/conversion data missing"
- Solution: Ensure calls table has sentiment_score and conversion_successful fields populated

## Architecture Diagram

```
┌─────────────────┐
│   Cron Job      │ Runs Monday 2 AM
│  (Weekly)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analyze Calls  │ analyzeCallsForOptimization()
│  (Claude API)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │ generateImprovements()
│ Improvements    │
│  (Claude API)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Email     │ Weekly report with action buttons
│  Notification   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│ Accept │ │ Reject │
└───┬────┘ └────────┘
    │
    ▼
┌─────────────────┐
│  Start A/B Test │ 75% control / 25% test
│   (7 days)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Evaluate       │ Compare metrics
│  Results        │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐ ┌──────────┐
│Promote │ │Keep      │
│  Test  │ │ Control  │
└────────┘ └──────────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│  Send Results   │ Success/failure email
│     Email       │
└─────────────────┘
```

## Contributing

When adding new features:
1. Update database schema if needed
2. Add API endpoints with proper error handling
3. Write tests in `tests/optimization-system.test.ts`
4. Update this documentation
5. Add email templates
6. Test end-to-end workflow

## License

Part of Voice AI Platform - All rights reserved
