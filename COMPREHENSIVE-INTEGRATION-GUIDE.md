# Comprehensive Integration System Guide

## Overview

This voice AI platform now includes a complete integration ecosystem supporting 9 different platforms across calendar booking, CRM, field services, payments, and webhooks.

## Supported Integrations

### Calendar & Scheduling
1. **Google Calendar** - OAuth-based calendar integration
2. **Calendly** - Professional scheduling platform
3. **Cal.com** - Open-source scheduling infrastructure

### CRM Platforms
4. **HubSpot** - Enterprise marketing & sales CRM
5. **Salesforce** - Enterprise CRM with leads and opportunities
6. **GoHighLevel** - All-in-one marketing & CRM platform

### Field Services
7. **Housecall Pro** - Home services business management

### Automation & Webhooks
8. **Zapier** - Connect to 5,000+ apps via webhooks

### Payment Processing
9. **Stripe** - Payment processing and billing

---

## Architecture

### Base Integration Class

All integrations extend `BaseIntegration` from `/lib/integrations/base-integration.ts`:

```typescript
export abstract class BaseIntegration {
  // Core methods all integrations must implement
  abstract getType(): IntegrationType;
  abstract getName(): string;
  abstract validateConnection(): Promise<IntegrationResponse<boolean>>;

  // Contact management
  abstract createContact(data: ContactData): Promise<IntegrationResponse<{ contactId: string }>>;
  abstract updateContact(contactId: string, data: Partial<ContactData>): Promise<IntegrationResponse<void>>;
  abstract findContact(phone?: string, email?: string): Promise<IntegrationResponse<{ contactId: string } | null>>;

  // Notes & activities
  abstract addNote(data: NoteData): Promise<IntegrationResponse<{ noteId: string }>>;

  // Optional: Calendar & appointments
  async checkAvailability(date: string, timezone: string): Promise<IntegrationResponse<{ availableSlots: string[] }>>;
  async bookAppointment(data: AppointmentData): Promise<IntegrationResponse<{ appointmentId: string }>>;

  // Optional: Workflows
  async triggerWorkflow(workflowId: string, contactId: string, data?: Record<string, any>): Promise<IntegrationResponse<void>>;

  // Post-call processing
  async processCallData(callData: CallData): Promise<IntegrationResponse<void>>;
}
```

### Integration Factory

The `IntegrationFactory` (`/lib/integrations/integration-factory.ts`) creates integration instances:

```typescript
const integration = IntegrationFactory.create(connection);
await integration.validateConnection();
await integration.processCallData(callData);
```

---

## Integration Details

### 1. Google Calendar

**Auth Type:** OAuth 2.0
**File:** `/lib/integrations/google-calendar.ts`
**Features:**
- Check calendar availability
- Book appointments
- Send email invitations
- Multiple calendar support

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `{APP_URL}/api/integrations/oauth/google/callback`
4. Enable Google Calendar API

**Configuration:**
```json
{
  "calendar_id": "primary",
  "business_hours_start": 9,
  "business_hours_end": 17,
  "slot_duration_minutes": 60
}
```

---

### 2. Calendly

**Auth Type:** OAuth 2.0
**File:** `/lib/integrations/calendly.ts`
**Features:**
- Check availability
- Book appointments
- Event type management
- Webhook notifications
- Automatic email confirmations

**Environment Variables:**
```bash
CALENDLY_CLIENT_ID=your_client_id
CALENDLY_CLIENT_SECRET=your_client_secret
```

**OAuth Setup:**
1. Go to [Calendly Developer Portal](https://developer.calendly.com/)
2. Create OAuth application
3. Add redirect URI: `{APP_URL}/api/integrations/oauth/calendly/callback`

**Configuration:**
```json
{
  "event_type_uri": "/event_types/XXXXXXXXXX"
}
```

**OAuth Routes:**
- Authorize: `/api/integrations/oauth/calendly/authorize`
- Callback: `/api/integrations/oauth/calendly/callback`

---

### 3. Cal.com

**Auth Type:** API Key
**File:** `/lib/integrations/cal-com.ts`
**Features:**
- Check availability
- Book appointments
- Multiple event types
- Webhook support
- Custom branding

**Environment Variables:**
```bash
CAL_COM_API_KEY=your_api_key
```

**API Key Setup:**
1. Go to [Cal.com Settings](https://cal.com/settings/developer/api-keys)
2. Generate new API key
3. Copy and store securely

**Configuration:**
```json
{
  "event_type_id": "123456"
}
```

**Test Script:**
```bash
npx tsx scripts/test-cal-com.ts
```

---

### 4. HubSpot

**Auth Type:** OAuth 2.0
**File:** `/lib/integrations/hubspot.ts`
**Features:**
- Contact management
- Deal/opportunity tracking
- Meeting scheduling
- Notes and engagements
- Workflow enrollment
- Custom field mapping

**Environment Variables:**
```bash
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
```

**OAuth Scopes:**
- `crm.objects.contacts.write`
- `crm.objects.contacts.read`
- `crm.objects.deals.write`
- `crm.objects.deals.read`
- `crm.schemas.contacts.read`
- `crm.schemas.deals.read`

**Configuration:**
```json
{
  "pipeline_id": "default",
  "default_stage_id": "appointmentscheduled",
  "field_mappings": {
    "custom_field_1": "hubspot_property_name"
  }
}
```

---

### 5. Salesforce

**Auth Type:** OAuth 2.0
**File:** `/lib/integrations/salesforce.ts`
**Features:**
- Lead/Contact management
- Task creation
- Event scheduling
- Opportunity tracking
- Custom field mapping

**Environment Variables:**
```bash
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
```

**OAuth Setup:**
1. Go to Salesforce Setup → App Manager
2. Create Connected App
3. Enable OAuth Settings
4. Add callback URL: `{APP_URL}/api/integrations/salesforce/callback`
5. Add scopes: `full`, `refresh_token`

**Configuration:**
```json
{
  "create_as": "Lead",
  "default_stage": "Prospecting",
  "field_mappings": {
    "custom_field": "Custom_Field__c"
  }
}
```

---

### 6. GoHighLevel

**Auth Type:** API Key
**File:** `/lib/integrations/gohighlevel.ts`
**Features:**
- Contact management
- Call notes with recordings
- Calendar appointments
- Workflow triggering
- Pipeline management
- Custom field mapping

**Environment Variables:**
```bash
GHL_API_KEY=your_api_key
GHL_LOCATION_ID=your_location_id
```

**API Key Setup:**
1. Go to [GoHighLevel Settings](https://app.gohighlevel.com/settings/integrations)
2. Navigate to API tab
3. Generate API key

**Configuration:**
```json
{
  "location_id": "your_location_id",
  "calendar_id": "calendar_id",
  "business_hours_start": 9,
  "business_hours_end": 17,
  "slot_duration_minutes": 60,
  "field_mappings": {
    "call_outcome": "customField.call_result"
  }
}
```

**Test Script:**
```bash
node scripts/test-ghl-integration.js
```

---

### 7. Housecall Pro

**Auth Type:** API Key
**File:** `/lib/integrations/housecall-pro.ts`
**Features:**
- Customer management
- Job creation
- Dispatch scheduling
- Service notes

**Environment Variables:**
```bash
HOUSECALL_PRO_API_KEY=your_api_key
```

**API Key Setup:**
1. Go to [Housecall Pro Settings](https://pro.housecallpro.com/settings/integrations)
2. Navigate to API section
3. Generate API key

**Configuration:**
```json
{
  "company_id": "your_company_id",
  "default_employee_id": "employee_id",
  "business_hours_start": 8,
  "business_hours_end": 18,
  "slot_duration_minutes": 120
}
```

---

### 8. Zapier

**Auth Type:** Webhook
**File:** `/lib/integrations/zapier.ts`
**Features:**
- Send call data to any app
- Unlimited automation possibilities
- Custom data transformations
- Multi-step workflows

**Setup:**
1. Create a Zap in [Zapier](https://zapier.com/app/zaps)
2. Use "Webhooks by Zapier" as trigger
3. Choose "Catch Hook"
4. Copy webhook URL
5. Paste into integration config

**Webhook Payload:**
```json
{
  "action": "call_completed",
  "call": {
    "call_id": "call_abc123",
    "agent_id": "agent_xyz789",
    "customer_name": "Jane Smith",
    "customer_phone": "+14079780655",
    "customer_email": "jane@example.com",
    "call_outcome": "appointment_booked",
    "call_summary": "Customer scheduled roof repair",
    "call_sentiment": "positive",
    "transcript": "Full call transcript...",
    "recording_url": "https://...",
    "started_at": "2026-02-15T14:30:00Z",
    "ended_at": "2026-02-15T14:35:00Z",
    "duration_seconds": 300,
    "appointment_booked": {
      "title": "Roof Repair",
      "date": "2026-02-20",
      "time": "14:00",
      "timezone": "America/New_York",
      "durationMinutes": 120
    }
  },
  "timestamp": "2026-02-15T14:35:01Z"
}
```

**Test Webhook:**
```typescript
import { ZapierIntegration } from '@/lib/integrations/zapier';
const success = await ZapierIntegration.sendTestData(webhookUrl);
```

---

### 9. Stripe

**Auth Type:** API Key
**File:** `/lib/integrations/stripe-integration.ts`
**Features:**
- Customer management
- Payment processing
- Invoice creation
- Payment links
- Subscription management
- Webhook notifications

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_...  # Use sk_test_ for testing
```

**API Key Setup:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy Secret Key (use test key for development)
3. Store securely in environment variables

**Usage Examples:**

**Create Customer:**
```typescript
const result = await stripe.createContact({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+15555551234'
});
```

**Create Payment Intent:**
```typescript
const payment = await stripe.createPaymentIntent(
  customerId,
  99.99,
  'usd',
  'Service payment'
);
```

**Create Invoice:**
```typescript
const invoice = await stripe.createInvoice(
  customerId,
  [
    { description: 'Service Fee', amount: 100.00 },
    { description: 'Consultation', amount: 50.00 }
  ],
  dueDate
);
```

**Create Payment Link:**
```typescript
const link = await stripe.createPaymentLink(
  'Premium Package',
  299.99,
  'usd'
);
```

**Test Script:**
```bash
npx tsx scripts/test-stripe.ts
```

---

## Post-Call Processing

All integrations automatically process call data via the `processCallData` method:

```typescript
async processCallData(callData: CallData): Promise<IntegrationResponse<void>> {
  // 1. Create/find contact
  const contact = await this.getOrCreateContact({
    name: callData.customerName,
    phone: callData.customerPhone,
    email: callData.customerEmail,
  });

  // 2. Add call note with summary
  await this.addNote({
    contactId: contact.contactId,
    subject: `Call: ${callData.callOutcome}`,
    content: this.buildCallNote(callData),
    timestamp: callData.endedAt,
  });

  // 3. Book appointment if needed
  if (callData.appointmentBooked) {
    await this.bookAppointment({
      ...callData.appointmentBooked,
      contactId: contact.contactId
    });
  }
}
```

### Call Data Interface

```typescript
interface CallData {
  callId: string;
  agentId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  callOutcome: string;
  callSummary?: string;
  callSentiment?: string;
  transcript?: string;
  recordingUrl?: string;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  appointmentBooked?: AppointmentData;
}
```

---

## API Endpoints

### Agent Integrations

**List integrations for agent:**
```
GET /api/agents/[agentId]/integrations
```

**GoHighLevel specific routes:**
```
GET /api/agents/[agentId]/integrations/gohighlevel/calendars
GET /api/agents/[agentId]/integrations/gohighlevel/pipelines
GET /api/agents/[agentId]/integrations/gohighlevel/pipelines/[pipelineId]
GET /api/agents/[agentId]/integrations/gohighlevel/workflows
POST /api/agents/[agentId]/integrations/gohighlevel/test
```

### OAuth Endpoints

**Google Calendar:**
```
GET /api/integrations/oauth/google/authorize
GET /api/integrations/oauth/google/callback
```

**Calendly:**
```
GET /api/integrations/oauth/calendly/authorize
GET /api/integrations/oauth/calendly/callback
```

**GoHighLevel:**
```
GET /api/integrations/oauth/gohighlevel/authorize
GET /api/integrations/oauth/gohighlevel/callback
```

### Tool Endpoints

**Book Appointment (Retell function):**
```
POST /api/tools/book-appointment

Body:
{
  "agent_id": "agent_123",
  "customer_name": "John Doe",
  "customer_phone": "+15555551234",
  "customer_email": "john@example.com",
  "appointment_date": "2026-02-20",
  "appointment_time": "14:00",
  "duration_minutes": 60,
  "notes": "Roof inspection"
}
```

---

## Testing

### Test Scripts

All integrations include test scripts:

```bash
# Google Calendar (requires OAuth setup)
# Manual testing via UI

# Calendly
npx tsx scripts/test-calendly.ts

# Cal.com
npx tsx scripts/test-cal-com.ts

# GoHighLevel
node scripts/test-ghl-integration.js

# Stripe
npx tsx scripts/test-stripe.ts
```

### Environment Setup for Testing

Create `.env.local` with:

```bash
# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Calendly
CALENDLY_CLIENT_ID=
CALENDLY_CLIENT_SECRET=
CALENDLY_ACCESS_TOKEN=  # For testing
CALENDLY_EVENT_TYPE_URI=

# Cal.com
CAL_COM_API_KEY=
CAL_COM_EVENT_TYPE_ID=

# HubSpot
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# Salesforce
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=

# GoHighLevel
GHL_API_KEY=
GHL_LOCATION_ID=

# Housecall Pro
HOUSECALL_PRO_API_KEY=

# Stripe (use test key)
STRIPE_SECRET_KEY=sk_test_...
```

---

## Database Schema

### integration_connections table

```sql
CREATE TABLE integration_connections (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  organization_id UUID REFERENCES organizations(id),
  integration_type TEXT CHECK (integration_type IN (
    'google_calendar',
    'calendly',
    'cal_com',
    'gohighlevel',
    'zapier',
    'housecall_pro',
    'hubspot',
    'salesforce',
    'stripe'
  )),
  is_active BOOLEAN DEFAULT true,
  connection_status TEXT CHECK (connection_status IN ('connected', 'disconnected', 'error', 'expired')),
  auth_type TEXT CHECK (auth_type IN ('oauth', 'api_key', 'webhook')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  api_key TEXT,
  api_secret TEXT,
  instance_url TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  config JSONB DEFAULT '{}',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### integration_sync_logs table

```sql
CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY,
  integration_connection_id UUID REFERENCES integration_connections(id),
  call_id TEXT,
  operation_type TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  payload JSONB,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## Error Handling

All integrations use consistent error handling:

```typescript
interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// Common error codes
'AUTH_ERROR'          // Invalid credentials
'CONFIG_ERROR'        // Missing configuration
'NOT_FOUND'          // Resource not found
'RATE_LIMIT'         // Rate limit exceeded
'PROCESSING_ERROR'   // General processing error
'CONTACT_ERROR'      // Contact-related error
'WEBHOOK_ERROR'      // Webhook-related error
```

---

## Best Practices

1. **Always validate connections** before processing
2. **Use rate limiting** to avoid API throttling
3. **Log all operations** to integration_sync_logs
4. **Handle token refresh** for OAuth integrations
5. **Implement retry logic** for transient failures
6. **Use field mappings** for custom CRM fields
7. **Test with test/sandbox accounts** before production
8. **Monitor webhook deliveries** for Zapier/Stripe
9. **Keep API keys secure** in environment variables
10. **Document custom configurations** per integration

---

## Future Enhancements

Planned features:
- Two-way sync for contact updates
- Real-time webhook processing for all platforms
- Bulk import/export capabilities
- Advanced field mapping UI
- Integration health monitoring dashboard
- Automatic retry with exponential backoff
- Integration usage analytics
- Custom workflow builder

---

## Support & Resources

### Documentation Links
- [Google Calendar API](https://developers.google.com/calendar)
- [Calendly API](https://developer.calendly.com/)
- [Cal.com API](https://cal.com/docs/api)
- [HubSpot API](https://developers.hubspot.com/)
- [Salesforce API](https://developer.salesforce.com/)
- [GoHighLevel API](https://highlevel.stoplight.io/)
- [Housecall Pro API](https://docs.housecallpro.com/)
- [Zapier Webhooks](https://zapier.com/help/create/code-webhooks)
- [Stripe API](https://stripe.com/docs/api)

### Internal Files
- Base integration: `/lib/integrations/base-integration.ts`
- Factory: `/lib/integrations/integration-factory.ts`
- Exports: `/lib/integrations/index.ts`
- Individual integrations: `/lib/integrations/*.ts`
- Test scripts: `/scripts/test-*.ts`

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0
