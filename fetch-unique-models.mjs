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

// Get unique models
const uniqueModels = [...new Set(llms.map(l => l.model))].sort();

console.log('\n📋 Unique Retell LLM Models:\n');
uniqueModels.forEach(model => {
  // Find one LLM with this model
  const llm = llms.find(l => l.model === model);
  console.log(`${model}`);
  console.log(`  Example LLM ID: ${llm.llm_id}`);
  console.log('');
});
