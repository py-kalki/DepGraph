'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelModalProps {
  onClose: () => void;
}

export default function CancelModal({ onClose }: CancelModalProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/cancel-subscription', { method: 'POST' });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Cancellation failed');
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close cancel modal">✕</button>
        <h2 id="cancel-modal-title" className="modal-title">Cancel subscription</h2>
        <p className="modal-description">
          Your Pro access will continue until the end of your current billing period.
          After that, your account will revert to the Free plan.
        </p>
        {error && <p className="modal-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button
            id="confirm-cancel-subscription"
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Cancelling…' : 'Yes, cancel my subscription'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Keep my plan</button>
        </div>
      </div>
    </div>
  );
}
