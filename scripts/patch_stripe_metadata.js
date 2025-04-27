// Patch Stripe metadata for existing customers missing supabase_user_id
// Usage: node patch_stripe_metadata.js

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // 1. Find all profiles with a NULL stripe_customer_id but who are known to be subscribed
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, stripe_customer_id, water_subscription_status')
    .is('stripe_customer_id', null)
    .eq('water_subscription_status', 'active');

  if (error) {
    console.error('Supabase fetch error:', error);
    process.exit(1);
  }

  for (const profile of profiles) {
    // Try to find a Stripe customer by email
    const customers = await stripe.customers.list({ email: profile.email, limit: 10 });
    if (!customers.data.length) {
      console.warn(`No Stripe customer found for email: ${profile.email}`);
      continue;
    }
    for (const customer of customers.data) {
      // Patch metadata
      const updated = await stripe.customers.update(customer.id, {
        metadata: { ...customer.metadata, supabase_user_id: profile.id },
      });
      console.log(`Patched Stripe customer ${customer.id} for email ${profile.email} with supabase_user_id ${profile.id}`);
    }
  }
  console.log('Done patching Stripe metadata.');
}

main().catch(console.error);
