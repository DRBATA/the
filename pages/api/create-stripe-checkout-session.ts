import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// New admin client to bypass RLS when updating profiles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { priceId, successUrl, cancelUrl, supabaseUserId, email } = req.body;
  console.log('[create-stripe-checkout-session] Received fields:', {
    priceId,
    successUrl,
    cancelUrl,
    supabaseUserId,
    email,
  });
  if (!priceId || !successUrl || !cancelUrl || !supabaseUserId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // 1. Lookup or create Stripe customer for this user
    let customerId: string | undefined;
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', supabaseUserId).single();
    if (profile && profile.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Always include both supabase_user_id and email in metadata for new users
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: supabaseUserId, email },
      });
      customerId = customer.id;
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', supabaseUserId);
      if (updateError) {
        console.error('[create-stripe-checkout-session] Failed to update stripe_customer_id:', updateError);
      }
    }
    // 2. Create Checkout Session with user ID in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: supabaseUserId,
        email,
      },
    });
    res.status(200).json({ url: session.url });
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
      message = (e as { message: string }).message;
    }
    console.error(`[${new Date().toISOString()}] Error in create-stripe-checkout-session:`, {
      message,
      error: e,
      requestBody: req.body,
    });
    res.status(500).json({ error: message });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await mainHandler(req, res);
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Unexpected server error' });
    }
  }
}
