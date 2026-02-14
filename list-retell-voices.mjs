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

console.log('\n🎙️ Available Retell Voices:\n');

// Filter for English voices mentioned in the UI
const interestingVoices = voices.filter(v => 
  v.voice_id.includes('Adrian') || 
  v.voice_id.includes('Sarah') ||
  v.voice_id.includes('Alloy') ||
  v.voice_id.includes('Shimmer') ||
  v.accent?.toLowerCase().includes('american')
);

interestingVoices.slice(0, 20).forEach(voice => {
  console.log(`ID: ${voice.voice_id}`);
  console.log(`Name: ${voice.voice_name}`);
  console.log(`Gender: ${voice.gender || 'N/A'}`);
  console.log(`Provider: ${voice.provider}`);
  console.log(`Accent: ${voice.accent || 'N/A'}`);
  console.log('---');
});

console.log(`\nTotal voices found: ${voices.length}`);
console.log(`English/American voices: ${interestingVoices.length}`);
