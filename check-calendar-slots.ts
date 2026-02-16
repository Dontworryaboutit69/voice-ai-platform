/**
 * Check available slots in GoHighLevel calendar
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSlots() {
  const { data: integration } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'gohighlevel')
    .single();

  if (!integration) {
    console.log('No integration found');
    return;
  }

  const calendarId = integration.config.calendar_id;
  const apiKey = integration.api_key;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  const startDate = '2026-02-20';
  const endDate = '2026-03-20';

  console.log('Checking slots for calendar:', calendarId);
  console.log('Date range:', startDate, 'to', endDate);

  const url = `https://rest.gohighlevel.com/v1/calendars/${calendarId}/free-slots?startDate=${startDate}&endDate=${endDate}`;

  const response = await fetch(url, { headers });
  console.log('Status:', response.status);

  if (response.ok) {
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
  } else {
    const error = await response.text();
    console.log('\nError:', error);
  }
}

checkSlots().catch(console.error);
