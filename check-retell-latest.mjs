import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

const callId = 'call_70dba08239b5ca1c6792c9926ee';

try {
  const call = await retell.call.retrieve(callId);
  console.log('\n📞 Call from Retell API:\n');
  console.log('ID:', call.call_id);
  console.log('Status:', call.call_status);
  console.log('Start timestamp:', call.start_timestamp);
  console.log('End timestamp:', call.end_timestamp);
  console.log('Duration:', call.duration_ms || call.call_duration_ms);
  console.log('Has transcript:', call.transcript ? 'YES' : 'NO');
  console.log('Has recording:', call.recording_url ? 'YES' : 'NO');
} catch (error) {
  console.error('Error:', error.message);
}
