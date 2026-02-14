// Script to add environment variables to Vercel
// Run this after getting a Vercel token

const projectId = 'prj_xyz'; // We need to find this

const envVars = [
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NDEzMCwiZXhwIjoyMDg2NTMwMTMwfQ.98ObnIbcDcfFpc5UTVwDbzk87l60-00IwsMcco9_ryE',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://qoendwnzpsmztgonrxzq.supabase.co',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5kd256cHNtenRnb25yeHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTQxMzAsImV4cCI6MjA4NjUzMDEzMH0.WBxPzqXWeuFqzfPKzyAkpNVtqiY_vkSBKk1FZy7zg5A',
    target: ['production', 'preview', 'development']
  }
];

console.log('To add these env vars to Vercel:');
console.log('\n1. Go to: https://vercel.com/kyles-projects-84986792/voice-ai-platform/settings/environment-variables');
console.log('\n2. Click "Add New" for each:');
envVars.forEach(env => {
  console.log(`\n   - Key: ${env.key}`);
  console.log(`     Value: ${env.value.substring(0, 20)}...`);
  console.log(`     Targets: ${env.target.join(', ')}`);
});
console.log('\n3. Click "Save" and then "Redeploy" the production deployment');
