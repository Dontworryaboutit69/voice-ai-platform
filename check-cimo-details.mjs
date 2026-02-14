import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const response = await fetch('https://api.retellai.com/list-voices', {
  headers: {
    'Authorization': `Bearer ${envVars.RETELL_API_KEY}`
  }
});

const voices = await response.json();

const cimoVoices = voices.filter(v => v.voice_id?.toLowerCase().includes('cimo'));

console.log('\n🎙️ Cimo Voice Details:\n');
cimoVoices.forEach(v => {
  console.log(`ID: ${v.voice_id}`);
  console.log(`Name: ${v.voice_name}`);
  console.log(`Gender: ${v.gender}`);
  console.log(`Provider: ${v.provider}`);
  console.log(`Accent: ${v.accent || 'N/A'}`);
  console.log('---');
});
