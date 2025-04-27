import React from "react";

import { useEffect, useState } from "react";
import { useUser } from "../../contexts/user-context";

interface ManageSubscriptionPanelProps {
  status: string | null | undefined;
  open: boolean;
  onClose: () => void;
  stripeCustomerId?: string | null;
}

interface SubscriptionDetails {
  id: string;
  status: string;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  current_period_end: number;
  current_period_start: number;
  plan: {
    nickname: string;
    amount: number;
    currency: string;
    interval: string;
  };
  payment_method: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
}


const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: "green", text: "Active" },
  past_due: { color: "yellow", text: "Payment Past Due" },
  canceled: { color: "red", text: "Canceled" },
};

export default function ManageSubscriptionPanel({ status, open, onClose, stripeCustomerId }: ManageSubscriptionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!open || !stripeCustomerId) return;
    setLoading(true);
    setDetails(null);
    fetch("/api/subscription-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: stripeCustomerId })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setDetails(data.subscription);
      })
      .catch(e => console.error('Subscription details fetch error:', e))
      .finally(() => setLoading(false));
  }, [open, stripeCustomerId]);
  if (!open) return null;
  const mapped = status ? statusMap[status] || { color: "gray", text: status } : { color: "gray", text: "Not Subscribed" };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-2">Manage Subscription</h2>
        <div className={`mb-4 font-semibold text-${mapped.color}-600`}>
          Status: {mapped.text}
        </div>
        {loading ? (
          <div className="text-gray-500 my-4">Loading subscription details…</div>
        ) : details ? (
          <div className="mb-4 text-gray-800">
            <div className="mb-2">
              <span className="font-semibold">Plan:</span> {details.plan.nickname || "N/A"} <span className="ml-2 text-gray-500">({(details.plan.amount / 100).toLocaleString(undefined, { style: 'currency', currency: details.plan.currency.toUpperCase() })} / {details.plan.interval})</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Next Renewal:</span> {details.current_period_end ? new Date(details.current_period_end * 1000).toLocaleDateString() : "-"}
            </div>
            {details.cancel_at_period_end && details.cancel_at ? (
              <div className="mb-2 text-yellow-700">
                <span className="font-semibold">Cancels:</span> {new Date(details.cancel_at * 1000).toLocaleDateString()}
              </div>
            ) : null}
            {details.canceled_at ? (
              <div className="mb-2 text-red-700">
                <span className="font-semibold">Canceled:</span> {new Date(details.canceled_at * 1000).toLocaleDateString()}
              </div>
            ) : null}
            {details.payment_method ? (
              <div className="mb-2">
                <span className="font-semibold">Payment Method:</span> {details.payment_method.brand?.toUpperCase()} **** {details.payment_method.last4} (exp {details.payment_method.exp_month}/{details.payment_method.exp_year})
              </div>
            ) : null}
          </div>
        ) : null}
        {status === "active" && (
          <>
            <div className="mb-2 text-green-700">Your subscription is active. Enjoy unlimited refills!</div>
            <button
              className="w-full py-2 px-4 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              disabled={loading}
              onClick={async () => {
                if (!user || !user.id) {
                  return;
                }
                setLoading(true);
                
                try {
                  const res = await fetch('/api/create-stripe-billing-portal-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ supabaseUserId: user.id })
                  });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    console.error('Failed to open billing portal:', data.error);
                  }
                } catch (e: unknown) {
  
  console.error('Subscription error:', e);

                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? 'Redirecting…' : 'Manage Billing'}
            </button>
          </>
        )}
        {status === "past_due" && (
          <>
            <div className="mb-2 text-yellow-700">Payment is past due. Please update your payment method.</div>
            <button
              className="w-full py-2 px-4 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
              disabled={loading}
              onClick={async () => {
                if (!user || !user.id) {
                  return;
                }
                setLoading(true);
                
                try {
                  const res = await fetch('/api/create-stripe-billing-portal-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ supabaseUserId: user.id })
                  });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    console.error('Failed to open billing portal:', data.error);
                  }
                } catch (e: unknown) {
  
  console.error('Subscription error:', e);

                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? 'Redirecting…' : 'Fix Payment'}
            </button>
          </>
        )}
        {(!status || status === "canceled") && (
  <>
    <div className="mb-2 text-gray-700">You are not currently subscribed.</div>
    <button
      className="w-full py-2 px-4 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
      disabled={loading}
      onClick={async () => {
        if (!user || !user.id || !user.email) {
          return;
        }
        setLoading(true);
        try {
          const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';
          const res = await fetch('/api/create-stripe-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId,
              successUrl: window.location.origin + '/?sub=success',
              cancelUrl: window.location.origin + '/?sub=cancel',
              supabaseUserId: user.id,
              email: user.email,
            })
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            console.error('Backend error:', data.error, data);
          }
        } catch (e: unknown) {
          // Optionally handle unknown error
          console.error('Subscription error:', e);

        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? 'Redirecting…' : 'Subscribe Now'}
    </button>
  </>
)}
        
      </div>
    </div>
  );
}
