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

// Search for Cimo
const cimoVoices = voices.filter(v => 
  v.voice_id?.toLowerCase().includes('cimo') || 
  v.voice_name?.toLowerCase().includes('cimo')
);

if (cimoVoices.length > 0) {
  console.log('Found Cimo voices:');
  cimoVoices.forEach(v => console.log(`  ${v.voice_id} - ${v.voice_name}`));
} else {
  console.log('No Cimo voice found. Showing all ElevenLabs voices:');
  const elevenLabsVoices = voices.filter(v => v.provider === 'elevenlabs');
  elevenLabsVoices.forEach(v => {
    console.log(`  ${v.voice_id} - ${v.voice_name} (${v.gender})`);
  });
}
