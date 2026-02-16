/**
 * Test Stripe Integration
 * Usage: npx tsx scripts/test-stripe.ts
 */

import 'dotenv/config';
import { StripeIntegration } from '@/lib/integrations/stripe-integration';

// NOTE: Set these in .env.local or pass as environment variables
// Use test mode secret key (starts with sk_test_)
const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY || '';

async function testStripeIntegration() {
  console.log('='.repeat(60));
  console.log('Stripe Integration Test Suite');
  console.log('='.repeat(60));
  console.log('');

  if (!STRIPE_API_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not set in environment');
    return;
  }

  if (!STRIPE_API_KEY.startsWith('sk_test_')) {
    console.warn('⚠️  Warning: Not using test mode key. Please use sk_test_ key for testing!');
  }

  const mockConnection = {
    id: 'test-123',
    agent_id: 'test-agent',
    organization_id: 'test-org',
    integration_type: 'stripe' as const,
    is_active: true,
    connection_status: 'connected' as const,
    auth_type: 'api_key' as const,
    api_key: STRIPE_API_KEY,
    config: {},
    sync_enabled: true
  };

  const stripe = new StripeIntegration(mockConnection);

  // Test 1: Validate connection
  console.log('🔗 Test 1: Validate connection...');
  const validation = await stripe.validateConnection();
  if (validation.success) {
    console.log('✅ Connection valid!');
  } else {
    console.log('❌ Connection invalid:', validation.error);
    return;
  }

  console.log('');

  // Test 2: Create customer
  console.log('👤 Test 2: Create customer...');
  const contactResult = await stripe.createContact({
    name: 'Test Customer',
    email: 'test-customer@example.com',
    phone: '+15555551234',
    address: '123 Test St',
    customFields: {
      source: 'voice-ai-test'
    }
  });

  if (contactResult.success) {
    console.log('✅ Customer created!');
    console.log('   Customer ID:', contactResult.data?.contactId);

    const customerId = contactResult.data!.contactId;

    // Test 3: Update customer
    console.log('');
    console.log('📝 Test 3: Update customer...');
    const updateResult = await stripe.updateContact(customerId, {
      phone: '+15555559999'
    });

    if (updateResult.success) {
      console.log('✅ Customer updated!');
    } else {
      console.log('❌ Failed to update customer:', updateResult.error);
    }

    // Test 4: Find customer by email
    console.log('');
    console.log('🔍 Test 4: Find customer by email...');
    const findResult = await stripe.findContact(undefined, 'test-customer@example.com');

    if (findResult.success && findResult.data) {
      console.log('✅ Customer found!');
      console.log('   Customer ID:', findResult.data.contactId);
    } else if (findResult.success && !findResult.data) {
      console.log('⚠️  Customer not found (might need time to index)');
    } else {
      console.log('❌ Failed to find customer:', findResult.error);
    }

    // Test 5: Create payment intent
    console.log('');
    console.log('💳 Test 5: Create payment intent...');
    const paymentResult = await stripe.createPaymentIntent(
      customerId,
      50.00, // $50.00
      'usd',
      'Test payment from integration',
      { test: 'true' }
    );

    if (paymentResult.success) {
      console.log('✅ Payment intent created!');
      console.log('   Payment Intent ID:', paymentResult.data?.paymentIntentId);
      console.log('   Client Secret:', paymentResult.data?.clientSecret.substring(0, 20) + '...');
    } else {
      console.log('❌ Failed to create payment intent:', paymentResult.error);
    }

    // Test 6: Create payment link
    console.log('');
    console.log('🔗 Test 6: Create payment link...');
    const paymentLinkResult = await stripe.createPaymentLink(
      'Test Product',
      25.00, // $25.00
      'usd',
      1
    );

    if (paymentLinkResult.success) {
      console.log('✅ Payment link created!');
      console.log('   Payment Link ID:', paymentLinkResult.data?.paymentLinkId);
      console.log('   URL:', paymentLinkResult.data?.url);
    } else {
      console.log('❌ Failed to create payment link:', paymentLinkResult.error);
    }

    // Test 7: Create invoice
    console.log('');
    console.log('🧾 Test 7: Create invoice...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceResult = await stripe.createInvoice(
      customerId,
      [
        { description: 'Service Fee', amount: 100.00 },
        { description: 'Consultation', amount: 150.00 }
      ],
      dueDate
    );

    if (invoiceResult.success) {
      console.log('✅ Invoice created!');
      console.log('   Invoice ID:', invoiceResult.data?.invoiceId);
      console.log('   Invoice URL:', invoiceResult.data?.invoiceUrl);
    } else {
      console.log('❌ Failed to create invoice:', invoiceResult.error);
    }

  } else {
    console.log('❌ Failed to create customer:', contactResult.error);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Test suite complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('ℹ️  Note: Test data created in Stripe. Clean up in your Stripe Dashboard.');
}

testStripeIntegration().catch(console.error);
