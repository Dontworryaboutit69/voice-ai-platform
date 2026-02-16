# AI Manager Testing Guide

## ⚠️ FIRST: Create the Database Tables

1. Open: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new
2. Copy the SQL from `RUN_THIS_SQL.md`
3. Click "Run"
4. Come back here

## ✅ Once Tables Are Created:

### Test 1: Evaluate a Single Call

```bash
# Test with a short call (should be filtered out)
curl "http://localhost:3000/api/test-evaluate-call?callId=bbcb84af-e93a-41d8-9ac8-abd9d2eb1a2b"
# Expected: {"message":"Call was filtered out (non-interactive)"}

# Test with a real call (71.8s - should evaluate)
curl "http://localhost:3000/api/test-evaluate-call?callId=099497bc-6bcc-4d7a-a371-86683b9a8f32"
# Expected: Full evaluation with scores
```

### Test 2: Check Evaluations in Database

```bash
# List all evaluations
curl "http://localhost:3000/api/agents/f02fd2dc-32d7-42b8-8378-126d354798f7/ai-manager/evaluations"
```

### Test 3: Analyze Patterns Across All Calls

```bash
# Analyze last 7 days
curl -X POST "http://localhost:3000/api/agents/f02fd2dc-32d7-42b8-8378-126d354798f7/ai-manager/analyze" \
  -H "Content-Type: application/json" \
  -d '{"daysSince": 7}'
```

### Test 4: Check for Suggestions

```bash
# Get pending suggestions
curl "http://localhost:3000/api/agents/f02fd2dc-32d7-42b8-8378-126d354798f7/ai-manager/suggestions?status=pending"
```

## 🎯 Expected Results:

**Your 10 Calls:**
- 4 short calls (<20s) → Filtered out
- 6 real calls (20s+) → Evaluated

**Pattern Detection:**
- After analyzing, if 3+ calls have the same issue → Suggestion generated
- Suggestion will appear in pending suggestions API

**What to Look For:**
1. Evaluation scores (0.0-1.0) for quality, empathy, professionalism, etc.
2. Detected issues with specific examples
3. Opportunities identified (missed upsells, incomplete qualification)
4. Patterns showing which issues appear frequently
5. Suggestions with proposed prompt changes

## 📊 Check Results in Supabase:

```sql
-- See all evaluations
SELECT * FROM ai_call_evaluations ORDER BY created_at DESC;

-- See detected issues across all calls
SELECT
  call_id,
  quality_score,
  empathy_score,
  issues_detected
FROM ai_call_evaluations
ORDER BY created_at DESC;

-- See suggestions
SELECT
  title,
  description,
  confidence_score,
  impact_estimate,
  status
FROM ai_improvement_suggestions
ORDER BY created_at DESC;

-- See patterns
SELECT
  total_calls_analyzed,
  patterns,
  avg_quality_score
FROM ai_pattern_analysis
ORDER BY created_at DESC;
```

## 🚀 After Testing:

If everything works:
1. The webhook will auto-evaluate new calls
2. Patterns will be detected nightly (or on-demand)
3. Suggestions will appear in AI Manager dashboard
4. You can accept/reject suggestions via API or UI

Now go run that SQL and come back! 🎉
