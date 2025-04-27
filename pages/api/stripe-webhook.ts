import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature']!;
    const buf = await buffer(req);
    let event: Stripe.Event | null = null;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    // Extra safety: TypeScript now knows `event` is defined beyond this point
    if (!event) {
      return res.status(400).end('No event payload');
    }

    // Handle customer.created AND customer.updated to update stripe_customer_id in Supabase (join on auth.users by email)
    if (event.type === 'customer.created' || event.type === 'customer.updated') {
      const customer = event.data.object as Stripe.Customer;
      const customerId = customer.id;
      const email = customer.email;
      // Prefer metadata-based lookup for reliability
      const supabaseUserIdFromMetadata = (customer.metadata as { [key: string]: string })?.supabase_user_id as string | undefined;

      console.log(`[Stripe webhook] ${event.type}: email`, email, 'metadata.supabase_user_id', supabaseUserIdFromMetadata, 'customerId', customerId);
      if (supabaseUserIdFromMetadata) {
        // Directly update profiles using the user ID from metadata
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', supabaseUserIdFromMetadata);

        if (error) {
          console.error('Supabase update error (customer.created via metadata):', error);
        } else {
          console.log('[Stripe webhook] Successfully updated profile by metadata.supabase_user_id:', supabaseUserIdFromMetadata);
        }
      } else if (email) {
        // Fallback: Look up the user in auth.users by email
        const { data: user, error: userError } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single();

        console.log('[Stripe webhook] Fallback: Lookup by email', email, 'result:', user, 'error:', userError);

        if (userError || !user) {
          console.error('User lookup failed in auth.users:', userError);
        } else {
          // Update the profiles table using the user's id
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);

          if (error) {
            console.error('Supabase update error (customer.created via email fallback):', error);
          } else {
            console.log('[Stripe webhook] Successfully updated profile by email fallback for UID:', user.id);
          }
        }
      }
    }

    // Handle checkout.session.completed for immediate feedback
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string | undefined;
      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          // Map all statuses except 'active' and 'trialing' to 'inactive' for business logic
          const status: 'active' | 'inactive' = (subscription.status === 'active' || subscription.status === 'trialing') ? 'active' : 'inactive';
          if (customerId && status) {
            const { error } = await supabaseAdmin
              .from('profiles')
              .update({ water_subscription_status: status })
              .eq('stripe_customer_id', customerId);
            if (error) {
              console.error('Supabase update error (checkout.session.completed):', error);
            }
          }
        } catch (err) {
          console.error('Error fetching subscription after checkout.session.completed:', err);
        }
      }
    }

    // Handle only subscription events (created / updated / deleted)
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      // Map all statuses except 'active' and 'trialing' to 'inactive' for business logic
      const status: 'active' | 'inactive' = (subscription.status === 'active' || subscription.status === 'trialing') ? 'active' : 'inactive';

      // Update the user's subscription status in Supabase
      if (customerId && status) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ water_subscription_status: status })
          .eq('stripe_customer_id', customerId);
        if (error) {
          console.error('Supabase update error (subscription event):', error);
        }
      }
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
