import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Expects: { customerId: string }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { customerId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }
  try {
    // Get subscriptions for this customer
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
    const subscription = subs.data[0];
    if (!subscription) {
      return res.status(200).json({ subscription: null });
    }
    // Get plan/price info
    const price = subscription.items.data[0]?.price;
    // Get payment method (if available)
    let paymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method === "string") {
      paymentMethod = await stripe.paymentMethods.retrieve(subscription.default_payment_method);
    }
    // Prepare response
    res.status(200).json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at: subscription.cancel_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at,
        // @ts-expect-error Stripe types may lag behind API
        current_period_end: subscription.current_period_end,
        // @ts-expect-error Stripe types may lag behind API
        current_period_start: subscription.current_period_start,
        plan: {
          nickname: price?.nickname,
          amount: price?.unit_amount,
          currency: price?.currency,
          interval: price?.recurring?.interval,
        },
        payment_method: paymentMethod
          ? {
              brand: paymentMethod.card?.brand,
              last4: paymentMethod.card?.last4,
              exp_month: paymentMethod.card?.exp_month,
              exp_year: paymentMethod.card?.exp_year,
            }
          : null,
      },
    });
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
      message = (e as { message: string }).message;
    }
    res.status(500).json({ error: message });
  }
}
