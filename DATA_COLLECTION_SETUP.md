# Post-Call Data Collection - Setup Complete! 🎉

## What Was Built

A complete post-call data collection system that lets users configure what information to extract from each call using Retell's built-in analysis.

## 🎯 Features

### 1. **Onboarding Integration**
- During agent creation, users select what fields to collect
- Standard fields: Name, Phone, Email, Service Requested, Address, Company, Contact Time
- Pre-selected defaults: Name, Phone, Email
- Clean checkbox UI with toggle selection

### 2. **Settings Page**
- Full data collection configuration panel
- All standard fields available
- Add custom fields with custom names and types
- Mark fields as required
- Save configuration and auto-update Retell agent

### 3. **Test Tab**
- Same configuration UI as settings
- Located at top of Test tab for easy access
- Configure and test in one place

### 4. **API Integration**
- `/api/agents/[agentId]/data-collection` - Save/update config
- Auto-updates Retell agent prompt with data collection instructions
- Stores config in database for persistence

### 5. **Database**
- `agent_data_collection_configs` table
- Stores fields as JSONB (flexible schema)
- RLS policies for security
- Automatic timestamps

## 📁 Files Created/Modified

### New Files:
1. `/supabase/migrations/006_post_call_data_collection.sql` - Database migration
2. `/app/agents/[agentId]/components/DataCollectionConfig.tsx` - Main UI component
3. `/app/api/agents/[agentId]/data-collection/route.ts` - API endpoint
4. `/MIGRATION_SQL.sql` - Simplified migration for Supabase editor
5. `/app/api/admin/run-migration/route.ts` - Migration helper (optional)

### Modified Files:
1. `/app/agents/[agentId]/page.tsx` - Added component to Test and Settings tabs
2. `/app/onboarding/page.tsx` - Added field selection to onboarding
3. `/app/api/agents/generate/route.ts` - Creates config during agent generation

## 🚀 Next Steps

### 1. Run the Database Migration ⚠️
You MUST run this before using the feature:

**Option A: Supabase SQL Editor (Easiest)**
1. Go to: https://supabase.com/dashboard/project/qoendwnzpsmztgonrxzq/sql/new
2. Copy all SQL from `/Users/kylekotecha/Desktop/voice-ai-platform/MIGRATION_SQL.sql`
3. Paste and click "Run"

**Option B: Using psql (if installed)**
```bash
psql -h aws-0-us-west-1.pooler.supabase.com -p 6543 -U postgres.pkzqafpnbfbnjflzuvbr -d postgres -f MIGRATION_SQL.sql
```

### 2. Test the Feature
1. Create a new agent via onboarding - select fields to collect
2. Go to existing agent → Settings tab → verify Data Collection section appears
3. Go to Test tab → verify Data Collection section appears at top
4. Try selecting/deselecting fields and saving

### 3. Verify Data Flow
After running a test call:
1. Check `calls` table → `call_analysis` column
2. Should contain extracted data based on configured fields
3. Data comes from Retell's post-call analysis webhook

## 🔧 How It Works

### User Flow:
1. **Onboarding**: User selects fields during agent creation
2. **Configuration saved**: Fields stored in `agent_data_collection_configs` table
3. **Retell updated**: Agent's prompt updated with data collection instructions
4. **Call happens**: User talks to agent
5. **Post-call**: Retell analyzes call and extracts configured fields
6. **Webhook**: `call_analyzed` event received with extracted data
7. **Storage**: Data saved to `calls.call_analysis` column

### Technical Stack:
- **Frontend**: React checkboxes with Lucide icons
- **State**: Local component state + Supabase
- **API**: Next.js API routes
- **Database**: Supabase PostgreSQL with JSONB
- **AI**: Retell's built-in post-call analysis (no Claude API needed!)

## 💡 Key Design Decisions

1. **Use Retell's Analysis**: Instead of Claude API for extraction (cheaper, simpler)
2. **JSONB Storage**: Flexible field definitions, easy to extend
3. **Three Locations**: Onboarding + Settings + Test (maximum discoverability)
4. **Pre-selected Defaults**: Name, phone, email (most common)
5. **Required Toggle**: Let users mark critical fields
6. **Custom Fields**: Users can add business-specific fields

## 🎨 UI Highlights

- Clean checkbox cards with hover states
- Blue selection state with checkmarks
- Collapsible custom field form
- Field type selector (text, phone, email)
- Required field toggle for each
- Save button with loading state
- Summary showing # of enabled fields
- Instructions panel explaining how it works

## 📊 Database Schema

```sql
agent_data_collection_configs
├── id (uuid, PK)
├── agent_id (uuid, FK → agents.id)
├── fields (jsonb)
│   └── [
│         { id, type, label, required, enabled, isCustom },
│         ...
│       ]
├── retell_analysis_config (jsonb)
└── created_at, updated_at (timestamptz)
```

## 🔒 Security

- RLS policies: Users can only configure their own org's agents
- Service role key: Used for server-side operations
- Input validation: Field types validated
- Retell integration: Secure API calls with auth

## 🐛 Known Issues / Future Enhancements

- [ ] Delivery system not yet built (SMS, Email, CRM, Webhooks)
- [ ] Can't preview extracted data in UI yet
- [ ] No analytics on extraction success rate
- [ ] No field validation rules (regex, min/max)
- [ ] No conditional fields (show field X if field Y is present)

## 📝 Notes

- The component uses `createBrowserClient` for client-side Supabase calls
- API route uses `createServiceClient` for server-side operations
- Retell agent prompt auto-updates when config changes
- Custom fields get unique IDs using timestamp
- Migration creates indexes for performance
