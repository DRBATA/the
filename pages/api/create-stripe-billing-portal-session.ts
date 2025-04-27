import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

// Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { supabaseUserId } = req.body;
  if (!supabaseUserId) {
    return res.status(400).json({ error: 'Missing supabaseUserId' });
  }
  try {
    // Lookup Stripe customer ID using admin client to bypass RLS
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', supabaseUserId)
      .single();
    
    if (error) {
      console.error(`[create-stripe-billing-portal] DB error for user ${supabaseUserId}:`, error);
      return res.status(400).json({ error: 'Error retrieving user profile' });
    }
    
    if (!profile?.stripe_customer_id) {
      console.error(`[create-stripe-billing-portal] No stripe_customer_id for user ${supabaseUserId}`);
      return res.status(400).json({ error: 'Stripe customer ID not found' });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: process.env.NEXT_PUBLIC_PORTAL_RETURN_URL || (req.headers.origin || 'http://localhost:3000'),
    });
    res.status(200).json({ url: portalSession.url });
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
      message = (e as { message: string }).message;
    }
    console.error(`[${new Date().toISOString()}] Error in create-stripe-billing-portal:`, {
      message,
      error: e,
      supabaseUserId
    });
    res.status(500).json({ error: message });
  }
}
