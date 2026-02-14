import Retell from 'retell-sdk';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const retell = new Retell({ apiKey: envVars.RETELL_API_KEY });

// List LLMs
const llms = await retell.llm.list();

console.log('\n📋 Available Retell LLM Models:\n');
llms.forEach(llm => {
  console.log(`ID: ${llm.llm_id}`);
  console.log(`Model: ${llm.model}`);
  console.log(`---`);
});
