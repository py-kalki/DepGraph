'use client';

import { useState } from 'react';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';

interface UpgradeModalProps {
  currentPlan: string;
  onClose:     () => void;
}

export default function UpgradeModal({ currentPlan, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro') => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/billing/create-subscription', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      });

      const data = await res.json() as {
        subscriptionId?: string;
        razorpayKeyId?: string;
        shortUrl?: string;
        error?: string;
      };

      if (data.subscriptionId && data.razorpayKeyId) {
        setLoading(false);
        // Open Razorpay embedded popup — stays on our site
        await openRazorpayCheckout({
          subscriptionId: data.subscriptionId,
          razorpayKeyId:  data.razorpayKeyId,
          name:           'DepGraph',
          description:    'Pro Plan — ₹99/month',
          onSuccess: async (response) => {
            await fetch('/api/billing/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            window.location.href = '/dashboard?upgraded=1';
          },
          onDismiss: () => {
            setLoading(false);
          },
        });
      } else if (data.shortUrl) {
        // Fallback: hosted Razorpay page
        window.location.href = data.shortUrl;
      } else {
        setError(data.error ?? 'Checkout unavailable. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close upgrade modal">✕</button>
        <h2 id="upgrade-modal-title" className="modal-title">Upgrade your plan</h2>
        <p className="modal-description">
          You are currently on the <strong>{currentPlan}</strong> plan.
        </p>

        <div className="upgrade-options">
          <button
            id="upgrade-to-pro"
            className="btn btn-primary upgrade-option"
            onClick={() => handleUpgrade('pro')}
            disabled={loading || currentPlan === 'pro'}
            aria-busy={loading}
          >
            {loading ? 'Opening checkout…' : 'Upgrade to Pro — ₹99/month'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#E24B4A', fontSize: '0.8125rem', marginTop: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
            ✗ {error}
          </p>
        )}

        <p className="modal-footnote">Secure checkout powered by Razorpay. Cancel anytime.</p>
      </div>
    </div>
  );
}
