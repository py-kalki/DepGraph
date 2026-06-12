'use client';

import { useState } from 'react';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';
import PaymentSuccessModal from '@/components/billing/PaymentSuccessModal';

interface UpgradeModalProps {
  currentPlan: string;
  onClose:     () => void;
}

export default function UpgradeModal({ currentPlan, onClose }: UpgradeModalProps) {
  const [loading, setLoading]               = useState(false);
  const [scriptLoading, setScriptLoading]   = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);

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
        await openRazorpayCheckout({
          subscriptionId: data.subscriptionId,
          razorpayKeyId:  data.razorpayKeyId,
          name:           'DepGraph',
          description:    'Pro Plan — ₹99/month',
          onLoading: (l) => setScriptLoading(l),
          onSuccess: async (response) => {
            // Verify + activate plan server-side
            await fetch('/api/billing/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            // Show congratulations modal
            setSuccessPaymentId(response.razorpay_payment_id);
          },
          onDismiss: () => setLoading(false),
        });
      } else if (data.shortUrl) {
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

  // Show congratulations modal after payment
  if (successPaymentId) {
    return (
      <PaymentSuccessModal
        paymentId={successPaymentId}
        onClose={() => { window.location.reload(); }}
      />
    );
  }

  return (
    <>
      {/* Script loading overlay */}
      {scriptLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', fontFamily: 'JetBrains Mono, monospace',
        }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid rgba(255,255,255,0.15)',
            borderTopColor: '#FFFFFF', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <p style={{ color: '#888888', fontSize: '0.8125rem' }}>Opening secure checkout…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

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
    </>
  );
}
