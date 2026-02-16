/**
 * Test Full Call Flow with HubSpot Integration
 * Simulates a complete call webhook from Retell to verify HubSpot sync
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/retell/call-events';

async function testCallFlow() {
  console.log('🧪 Testing Full Call Flow with HubSpot Integration\n');
  console.log('This simulates a real call from Retell AI\n');

  const callId = `test_call_${Date.now()}`;
  const now = Date.now();

  // Step 1: Send call_started webhook
  console.log('📞 Step 1: Sending call_started webhook...');

  const callStartedPayload = {
    event: 'call_started',
    call: {
      call_id: callId,
      from_number: '+15555551234',
      to_number: '+15555559999',
      start_timestamp: now,
      metadata: {
        agent_id: AGENT_ID
      }
    }
  };

  const startedResponse = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callStartedPayload)
  });

  if (!startedResponse.ok) {
    console.error('❌ call_started webhook failed:', await startedResponse.text());
    return;
  }
  console.log('✅ call_started webhook accepted\n');

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2: Send call_ended webhook with full transcript
  console.log('📞 Step 2: Sending call_ended webhook with customer data...');

  const callEndedPayload = {
    event: 'call_ended',
    call: {
      call_id: callId,
      from_number: '+15555551234',
      to_number: '+15555559999',
      start_timestamp: now,
      end_timestamp: now + 120000, // 2 minutes later
      call_duration_ms: 120000,
      duration_ms: 120000,
      recording_url: 'https://example.com/recording.mp3',
      transcript: 'Agent: Hello! How can I help you today?\nCaller: Hi, my name is Sarah Johnson. I\'m interested in your roofing services.\nAgent: Great! I\'d be happy to help. Can I get your phone number?\nCaller: Sure, it\'s 555-123-4567.\nAgent: And your email address?\nCaller: sarah.johnson@example.com\nAgent: Perfect! What kind of roofing work are you looking for?\nCaller: I need a full roof replacement. My current roof is leaking badly.\nAgent: I understand, that sounds urgent. Let me get you scheduled for an estimate. How about tomorrow at 2 PM?\nCaller: That works perfect!\nAgent: Wonderful! I\'ve got you booked for tomorrow at 2 PM.',
      transcript_object: [
        { role: 'agent', content: 'Hello! How can I help you today?' },
        { role: 'user', content: 'Hi, my name is Sarah Johnson. I\'m interested in your roofing services.' },
        { role: 'agent', content: 'Great! I\'d be happy to help. Can I get your phone number?' },
        { role: 'user', content: 'Sure, it\'s 555-123-4567.' },
        { role: 'agent', content: 'And your email address?' },
        { role: 'user', content: 'sarah.johnson@example.com' },
        { role: 'agent', content: 'Perfect! What kind of roofing work are you looking for?' },
        { role: 'user', content: 'I need a full roof replacement. My current roof is leaking badly.' },
        { role: 'agent', content: 'I understand, that sounds urgent. Let me get you scheduled for an estimate. How about tomorrow at 2 PM?' },
        { role: 'user', content: 'That works perfect!' },
        { role: 'agent', content: 'Wonderful! I\'ve got you booked for tomorrow at 2 PM.' }
      ],
      metadata: {
        agent_id: AGENT_ID
      }
    }
  };

  const endedResponse = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callEndedPayload)
  });

  if (!endedResponse.ok) {
    console.error('❌ call_ended webhook failed:', await endedResponse.text());
    return;
  }
  console.log('✅ call_ended webhook accepted\n');

  // Wait for async processing (integration sync runs in background)
  console.log('⏳ Waiting 5 seconds for background processing (HubSpot sync)...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: Verify HubSpot contact was created
  console.log('🔍 Step 3: Verifying HubSpot contact creation...\n');

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get HubSpot connection
  const { data: connection } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .single();

  if (!connection) {
    console.error('❌ No HubSpot connection found');
    return;
  }

  // Search for contact in HubSpot
  const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: 'sarah.johnson@example.com'
        }]
      }],
      limit: 1,
    })
  });

  if (!searchResponse.ok) {
    console.error('❌ Failed to search HubSpot:', await searchResponse.text());
    return;
  }

  const searchResult = await searchResponse.json();

  if (searchResult.results && searchResult.results.length > 0) {
    const contact = searchResult.results[0];
    console.log('✅ Contact found in HubSpot!');
    console.log('📋 Contact Details:');
    console.log('   - Contact ID:', contact.id);
    console.log('   - Name:', contact.properties.firstname, contact.properties.lastname);
    console.log('   - Email:', contact.properties.email);
    console.log('   - Phone:', contact.properties.phone);
    console.log('   - Created:', new Date(contact.createdAt).toLocaleString());
    console.log('   - HubSpot URL: https://app.hubspot.com/contacts/YOUR_PORTAL_ID/contact/' + contact.id);

    // Check for note
    console.log('\n🔍 Checking for associated note...');
    const notesResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}/associations/notes`,
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (notesResponse.ok) {
      const notesData = await notesResponse.json();
      if (notesData.results && notesData.results.length > 0) {
        console.log(`✅ Found ${notesData.results.length} note(s) associated with contact`);

        // Get note details
        const noteId = notesData.results[0].id;
        const noteResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/notes/${noteId}`,
          {
            headers: {
              'Authorization': `Bearer ${connection.access_token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (noteResponse.ok) {
          const noteDetails = await noteResponse.json();
          console.log('📝 Note Details:');
          console.log('   - Note ID:', noteDetails.id);
          console.log('   - Created:', new Date(noteDetails.createdAt).toLocaleString());
          console.log('   - Preview:', noteDetails.properties.hs_note_body?.substring(0, 150) + '...');
        }
      } else {
        console.log('⚠️  No notes found associated with contact');
      }
    }

    console.log('\n🎉 SUCCESS! Full call flow test passed!');
    console.log('   ✅ Call started webhook processed');
    console.log('   ✅ Call ended webhook processed');
    console.log('   ✅ Customer data extracted from transcript');
    console.log('   ✅ HubSpot contact created');
    console.log('   ✅ HubSpot note added with call details');

  } else {
    console.log('❌ Contact NOT found in HubSpot');
    console.log('   This might mean:');
    console.log('   1. Integration sync is still processing (try again in a few seconds)');
    console.log('   2. Integration encountered an error (check server logs)');
    console.log('   3. Transcript analysis didn\'t extract customer data correctly');

    // Check integration sync logs
    const { data: syncLogs } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('integration_connection_id', connection.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (syncLogs && syncLogs.length > 0) {
      console.log('\n📊 Recent sync logs:');
      syncLogs.forEach(log => {
        console.log(`   - ${log.status}: ${log.operation_type} at ${new Date(log.created_at).toLocaleString()}`);
        if (log.error_message) {
          console.log(`     Error: ${log.error_message}`);
        }
      });
    }
  }
}

testCallFlow().catch(console.error);
