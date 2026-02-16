/**
 * Check available slots in GoHighLevel calendar
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkAvailableSlots() {
  // Get integration
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
  const locationId = integration.config.location_id;
  const apiKey = integration.api_key;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  // Get calendar details and slots
  console.log('Calendar ID:', calendarId);
  console.log('\nFetching available slots for next 30 days...\n');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  try {
    // Try to get slots from calendar
    const slotsUrl = `https://rest.gohighlevel.com/v1/calendars/${calendarId}/free-slots?startDate=${startDateStr}&endDate=${endDateStr}`;
    console.log('Fetching from:', slotsUrl);

    const response = await fetch(slotsUrl, { headers });
    console.log('Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('\nAvailable Slots:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('\nError fetching slots:', error.substring(0, 500));

      // Try alternative endpoint
      console.log('\nTrying alternative endpoint...');
      const altUrl = `https://rest.gohighlevel.com/v1/calendars/${calendarId}/slots?startDate=${startDateStr}&endDate=${endDateStr}`;
      const altResponse = await fetch(altUrl, { headers });
      console.log('Alt Status:', altResponse.status);

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('\nAvailable Slots (alt):');
        console.log(JSON.stringify(altData, null, 2));
      } else {
        const altError = await altResponse.text();
        console.log('Alt Error:', altError.substring(0, 500));
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkAvailableSlots().catch(console.error);
