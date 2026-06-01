'use client';

import { useState } from 'react';

interface UpgradeModalProps {
  currentPlan: string;
  onClose:     () => void;
}

export default function UpgradeModal({ currentPlan, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro') => {
    setLoading(plan);
    try {
      const res  = await fetch('/api/billing/create-subscription', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      });
      const data = await res.json() as { shortUrl?: string };
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      }
    } catch {
      setLoading(null);
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
            disabled={loading !== null || currentPlan === 'pro'}
            aria-busy={loading === 'pro'}
          >
            {loading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro — ₹99/month'}
          </button>
        </div>

        <p className="modal-footnote">Secure checkout powered by Razorpay. Cancel anytime.</p>
      </div>
    </div>
  );
}
