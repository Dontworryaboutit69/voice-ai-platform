/**
 * OAuth Setup Verification Script
 * Checks if all required OAuth environment variables are configured
 */

const requiredEnvVars = {
  hubspot: [
    'HUBSPOT_CLIENT_ID',
    'HUBSPOT_CLIENT_SECRET',
    'HUBSPOT_REDIRECT_URI'
  ],
  salesforce: [
    'SALESFORCE_CLIENT_ID',
    'SALESFORCE_CLIENT_SECRET',
    'SALESFORCE_REDIRECT_URI'
  ]
};

function checkEnvironmentVariables() {
  console.log('🔍 Verifying OAuth Configuration...\n');

  let allConfigured = true;
  let missingVars: string[] = [];

  // Check HubSpot
  console.log('📊 HubSpot OAuth:');
  requiredEnvVars.hubspot.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('SECRET') ? '****' : value}`);
    } else {
      console.log(`  ❌ ${varName}: NOT SET`);
      allConfigured = false;
      missingVars.push(varName);
    }
  });

  console.log('\n⚡ Salesforce OAuth:');
  requiredEnvVars.salesforce.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('SECRET') ? '****' : value}`);
    } else {
      console.log(`  ❌ ${varName}: NOT SET`);
      allConfigured = false;
      missingVars.push(varName);
    }
  });

  console.log('\n' + '='.repeat(60));

  if (allConfigured) {
    console.log('✅ All OAuth environment variables are configured!\n');
    console.log('Next steps:');
    console.log('1. Run database migration: npx supabase migration up');
    console.log('2. Start dev server: npm run dev');
    console.log('3. Test OAuth flow in the Integrations tab\n');
    return true;
  } else {
    console.log('❌ Missing environment variables:\n');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\nTo fix:');
    console.log('1. Create .env.local file in project root');
    console.log('2. Add missing variables (see docs/OAUTH_SETUP.md)');
    console.log('3. Restart dev server\n');
    return false;
  }
}

// Run verification
checkEnvironmentVariables();
