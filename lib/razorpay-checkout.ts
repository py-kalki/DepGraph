// =============================================================================
// useRazorpay — loads Razorpay Checkout.js on demand and opens the popup
// Works for both one-time payments and subscriptions.
// =============================================================================

'use client';

export interface RazorpayCheckoutOptions {
  subscriptionId: string;
  razorpayKeyId: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onLoading?: (loading: boolean) => void;  // fires while checkout.js loads
  onSuccess: (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

/** Dynamically load the Razorpay checkout script (once). */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== 'undefined') { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
}

/** Open the Razorpay checkout popup for a subscription. */
export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  opts.onLoading?.(true);
  await loadRazorpayScript();
  opts.onLoading?.(false);

  const rzp = new window.Razorpay({
    key:             opts.razorpayKeyId,
    subscription_id: opts.subscriptionId,
    name:            opts.name ?? 'DepGraph',
    description:     opts.description ?? 'Pro Plan — ₹99/month',
    image:           '/logo.png',
    prefill:         opts.prefill ?? {},
    theme:           { color: '#000000' },
    modal: {
      ondismiss: () => opts.onDismiss?.(),
    },
    handler: (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
      opts.onSuccess(response);
    },
  });

  rzp.open();
}
