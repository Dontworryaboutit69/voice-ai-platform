/**
 * Debug OAuth Configuration
 * Checks if all OAuth environment variables are set correctly
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 OAuth Configuration Debug\n');

console.log('HubSpot Configuration:');
console.log('  CLIENT_ID:', process.env.HUBSPOT_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('  CLIENT_SECRET:', process.env.HUBSPOT_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  REDIRECT_URI:', process.env.HUBSPOT_REDIRECT_URI);

console.log('\nExpected OAuth Flow:');
console.log('  1. User clicks "Connect HubSpot"');
console.log('  2. Redirects to:', `http://localhost:3000/api/integrations/oauth/hubspot/authorize?agent_id=YOUR_AGENT_ID&state=RANDOM`);
console.log('  3. This redirects to HubSpot with these scopes:');
console.log('     - crm.objects.contacts.write');
console.log('     - crm.objects.contacts.read');
console.log('     - crm.objects.deals.write');
console.log('     - crm.objects.deals.read');
console.log('     - crm.schemas.contacts.read');
console.log('     - crm.schemas.deals.read');
console.log('  4. User authorizes in HubSpot');
console.log('  5. HubSpot redirects back to:', process.env.HUBSPOT_REDIRECT_URI);
console.log('  6. App exchanges code for access token');
console.log('  7. Saves connection to database\n');

console.log('Required HubSpot App Settings:');
console.log('  1. Go to: https://app.hubspot.com/developers');
console.log('  2. Click your app');
console.log('  3. Go to "Auth" tab');
console.log('  4. Set Redirect URL to:', process.env.HUBSPOT_REDIRECT_URI);
console.log('  5. Add ALL 6 scopes listed above');
console.log('  6. Save changes');
console.log('  7. Make sure app is not in "Development" mode if testing with different account\n');
