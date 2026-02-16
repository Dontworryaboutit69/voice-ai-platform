/**
 * Verify HubSpot Contact Creation
 * Checks if the test contact was created in HubSpot
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const AGENT_ID = 'f02fd2dc-32d7-42b8-8378-126d354798f7';

async function verifyContact() {
  console.log('🔍 Verifying HubSpot contact creation...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get HubSpot connection
  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('agent_id', AGENT_ID)
    .eq('integration_type', 'hubspot')
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    console.error('❌ No active HubSpot connection found');
    return;
  }

  console.log('✅ Found HubSpot connection');
  console.log('🔑 Access token:', connection.access_token?.substring(0, 20) + '...\n');

  // Search for the test contact by email
  const searchPayload = {
    filterGroups: [{
      filters: [{
        propertyName: 'email',
        operator: 'EQ',
        value: 'test@example.com'
      }]
    }],
    limit: 1,
  };

  const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchPayload),
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.json();
    console.error('❌ Failed to search contacts:', error);
    return;
  }

  const searchResult = await searchResponse.json();

  if (searchResult.results && searchResult.results.length > 0) {
    const contact = searchResult.results[0];
    console.log('✅ Contact found in HubSpot!');
    console.log('📋 Contact details:');
    console.log('   - Contact ID:', contact.id);
    console.log('   - Name:', contact.properties.firstname, contact.properties.lastname);
    console.log('   - Email:', contact.properties.email);
    console.log('   - Phone:', contact.properties.phone);
    console.log('   - Created:', new Date(contact.createdAt).toLocaleString());
    console.log('   - URL:', `https://app.hubspot.com/contacts/${connection.config?.portal_id || 'YOUR_PORTAL_ID'}/contact/${contact.id}`);

    // Check for associated notes
    console.log('\n🔍 Checking for associated notes...');

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
      console.log(`✅ Found ${notesData.results?.length || 0} associated note(s)`);

      if (notesData.results && notesData.results.length > 0) {
        // Get note details
        const noteId = notesData.results[0].id;
        const noteDetailsResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/notes/${noteId}`,
          {
            headers: {
              'Authorization': `Bearer ${connection.access_token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (noteDetailsResponse.ok) {
          const noteDetails = await noteDetailsResponse.json();
          console.log('📝 Note details:');
          console.log('   - Note ID:', noteDetails.id);
          console.log('   - Created:', new Date(noteDetails.createdAt).toLocaleString());
          console.log('   - Content preview:', noteDetails.properties.hs_note_body?.substring(0, 100) + '...');
        }
      }
    }
  } else {
    console.log('❌ Contact not found in HubSpot');
    console.log('   Email searched: test@example.com');
  }
}

verifyContact().catch(console.error);
