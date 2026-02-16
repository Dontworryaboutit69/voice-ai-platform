/**
 * Verify HubSpot OAuth Configuration
 * Helps diagnose scope and configuration issues
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 HubSpot OAuth Configuration Verification\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  HUBSPOT_CLIENT_ID:', process.env.HUBSPOT_CLIENT_ID || '❌ MISSING');
console.log('  HUBSPOT_CLIENT_SECRET:', process.env.HUBSPOT_CLIENT_SECRET ? '✅ Set' : '❌ MISSING');
console.log('  HUBSPOT_REDIRECT_URI:', process.env.HUBSPOT_REDIRECT_URI || '❌ MISSING');

// Required scopes
const REQUIRED_SCOPES = [
  'crm.objects.contacts.write',
  'crm.objects.contacts.read',
  'crm.objects.deals.write',
  'crm.objects.deals.read',
  'crm.schemas.contacts.read',
  'crm.schemas.deals.read',
];

console.log('\n📝 Required Scopes (Add these to your HubSpot app):');
console.log('=' .repeat(60));
REQUIRED_SCOPES.forEach((scope, index) => {
  console.log(`  ${index + 1}. ${scope}`);
});

console.log('\n🔗 HubSpot App Configuration Steps:');
console.log('=' .repeat(60));
console.log('1. Go to: https://app.hubspot.com/developers');
console.log('2. Find your app with Client ID:', process.env.HUBSPOT_CLIENT_ID);
console.log('3. Click on the app → Go to "Auth" tab');
console.log('\n4. In the "Scopes" section, add EACH of these scopes:');
REQUIRED_SCOPES.forEach((scope, index) => {
  console.log(`   ${index + 1}. ${scope}`);
});
console.log('\n5. In the "Redirect URLs" section, add:');
console.log(`   ${process.env.HUBSPOT_REDIRECT_URI}`);
console.log('\n6. Click "Save" at the bottom of the Auth tab');
console.log('\n7. If your app is in "Development" mode:');
console.log('   - You can only connect with the HubSpot account that owns the app');
console.log('   - To connect different accounts, switch to "Production" mode');

console.log('\n📊 OAuth Flow URLs:');
console.log('=' .repeat(60));
console.log('Authorization URL: https://app.hubspot.com/oauth/authorize');
console.log('Token Exchange URL: https://api.hubapi.com/oauth/v1/token');
console.log('Your Redirect URI:', process.env.HUBSPOT_REDIRECT_URI);

console.log('\n🧪 Next Steps After Configuration:');
console.log('=' .repeat(60));
console.log('1. Make sure your dev server is running: npm run dev');
console.log('2. Go to: http://localhost:3000/agents/f02fd2dc-32d7-42b8-8378-126d354798f7');
console.log('3. Click "Connect HubSpot" under integrations');
console.log('4. You should see a consent screen asking to approve the 6 scopes');
console.log('5. After approving, you\'ll be redirected back to your agent page');

console.log('\n⚠️  Common Issues:');
console.log('=' .repeat(60));
console.log('Issue: "Scope mismatch" error');
console.log('Solution: Make sure ALL 6 scopes above are added in HubSpot app settings');
console.log('');
console.log('Issue: "Invalid redirect_uri" error');
console.log('Solution: Add the exact redirect URI to your HubSpot app settings');
console.log('');
console.log('Issue: Can\'t connect different HubSpot account');
console.log('Solution: App must be in "Production" mode, not "Development" mode');

console.log('\n' + '='.repeat(60));
console.log('✅ Configuration guide complete!');
console.log('Follow the steps above to configure your HubSpot app.\n');
