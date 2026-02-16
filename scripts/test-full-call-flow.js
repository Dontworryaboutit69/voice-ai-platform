require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const agentId = '688291ea-e461-4067-85fd-591516ce5b35'; // Sunshine Dental

async function testFullFlow() {
  console.log('🧪 Testing Complete Call Integration Flow\n');
  
  // Step 1: Create a test call
  console.log('1️⃣  Creating test call in database...');
  const { data: call, error: callError } = await supabase
    .from('calls')
    .insert({
      agent_id: agentId,
      from_number: '+15555551234',
      to_number: '+15555559999',
      call_status: 'completed',
      call_duration: 180,
      transcript: 'Customer: Hi, I need to book a dental appointment.\nAgent: Of course! May I have your name and phone number?\nCustomer: My name is Sarah Johnson and my number is 555-123-4567.\nAgent: Perfect Sarah! We have an opening tomorrow at 2pm. Does that work?\nCustomer: Yes, that works great!\nAgent: Excellent! I have you booked for tomorrow at 2pm for a cleaning appointment.',
      recording_url: 'https://example.com/recording123.mp3',
      organization_id: '00000000-0000-0000-0000-000000000001'
    })
    .select()
    .single();

  if (callError) {
    console.error('❌ Failed to create call:', callError);
    return;
  }

  console.log(`✅ Test call created: ${call.id}\n`);

  // Step 2: Create call integration data
  console.log('2️⃣  Extracting customer data...');
  const { data: integrationData, error: dataError } = await supabase
    .from('call_integration_data')
    .insert({
      call_id: call.id,
      agent_id: agentId,
      customer_name: 'Sarah Johnson',
      customer_phone: '+15551234567',
      customer_email: 'sarah.johnson@email.com',
      call_outcome: 'appointment_booked',
      call_summary: 'Customer called to book a dental cleaning appointment. Successfully scheduled for tomorrow at 2pm.',
      call_sentiment: 'positive',
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      appointment_time: '14:00:00',
      appointment_timezone: 'America/New_York',
      service_requested: 'Dental Cleaning'
    })
    .select()
    .single();

  if (dataError) {
    console.error('❌ Failed to create integration data:', dataError);
    return;
  }

  console.log('✅ Customer data extracted\n');

  // Step 3: Get GoHighLevel integration
  console.log('3️⃣  Getting GoHighLevel integration...');
  const { data: integration, error: intError } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', agentId)
    .eq('integration_type', 'gohighlevel')
    .single();

  if (intError || !integration) {
    console.error('❌ Integration not found');
    return;
  }

  console.log(`✅ Integration found: ${integration.id}\n`);

  // Step 4: Create contact in GoHighLevel
  console.log('4️⃣  Creating contact in GoHighLevel...');
  
  const ghlPayload = {
    locationId: integration.config.location_id,
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+15551234567',
    email: 'sarah.johnson@email.com',
    tags: ['voice-ai-lead', 'appointment-booked']
  };

  const createResponse = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integration.api_key}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ghlPayload)
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    console.error('❌ Failed to create contact:', error);
    return;
  }

  const contactResult = await createResponse.json();
  const contactId = contactResult.contact?.id;
  
  console.log(`✅ Contact created in GHL: ${contactId}\n`);

  // Step 5: Add note to contact
  console.log('5️⃣  Adding call note to contact...');
  
  const notePayload = {
    contactId: contactId,
    body: `📞 Call Summary

Customer called to book a dental cleaning appointment. Successfully scheduled for tomorrow at 2pm.

📋 Call Details:
- Duration: 3 minutes
- Outcome: Appointment Booked
- Sentiment: Positive
- Service: Dental Cleaning
- Appointment: Tomorrow at 2:00 PM

🎧 Recording: https://example.com/recording123.mp3

Powered by Voice AI Platform`
  };

  const noteResponse = await fetch('https://rest.gohighlevel.com/v1/contacts/' + contactId + '/notes/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integration.api_key}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(notePayload)
  });

  if (!noteResponse.ok) {
    const error = await noteResponse.json();
    console.error('❌ Failed to add note:', error);
    return;
  }

  console.log('✅ Call note added to contact\n');

  // Step 6: Log the sync
  console.log('6️⃣  Logging integration sync...');
  
  await supabase
    .from('integration_sync_logs')
    .insert([
      {
        integration_connection_id: integration.id,
        call_id: call.id,
        operation_type: 'create_contact',
        direction: 'outbound',
        status: 'success',
        request_payload: ghlPayload,
        response_data: { contactId },
        completed_at: new Date().toISOString()
      },
      {
        integration_connection_id: integration.id,
        call_id: call.id,
        operation_type: 'create_note',
        direction: 'outbound',
        status: 'success',
        request_payload: notePayload,
        completed_at: new Date().toISOString()
      }
    ]);

  console.log('✅ Sync logged to database\n');

  // Final summary
  console.log('═'.repeat(60));
  console.log('✅ INTEGRATION TEST COMPLETE!');
  console.log('═'.repeat(60));
  console.log(`
📞 Call Created: ${call.id}
👤 Contact Created in GHL: ${contactId}
📝 Note Added: Yes
📊 Logs Saved: Yes

✅ Check GoHighLevel location ${integration.config.location_id}:
   - Contacts → Search for "Sarah Johnson"
   - Should see contact with phone +15551234567
   - Should have a note with call summary and recording link
  `);
}

testFullFlow().catch(console.error);
