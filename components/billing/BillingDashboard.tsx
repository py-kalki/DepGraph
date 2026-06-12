'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionStatus from './SubscriptionStatus';
import BillingHistoryTable from './BillingHistoryTable';
import UpgradeModal from './UpgradeModal';
import CancelModal from './CancelModal';
import type { DbSubscription, DbInvoice } from '@/lib/types';

interface BillingDashboardProps {
  plan:         'free' | 'pro';
  subscription: DbSubscription | null;
  invoices:     DbInvoice[];
}

export default function BillingDashboard({ plan, subscription, invoices }: BillingDashboardProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancel,  setShowCancel]  = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const router = useRouter();

  const canUpgrade = plan === 'free';
  // 'authenticated' = first payment done, waiting for Razorpay to confirm cycle
  const canCancel  = plan !== 'free' && ['active', 'authenticated'].includes(subscription?.status ?? '');

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/billing/sync', { method: 'POST' });
      router.refresh();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="billing-dashboard">
      <div className="settings-page-header">
        <h1 className="settings-page-title">Billing &amp; Subscription</h1>
        <p className="settings-page-description">
          Manage your plan, payment method, and invoices.
        </p>
      </div>

      {/* Current subscription */}
      <section className="settings-section" aria-labelledby="subscription-heading">
        <h2 id="subscription-heading" className="settings-section-title">Current plan</h2>
        <SubscriptionStatus subscription={subscription} plan={plan} />

        <div className="billing-actions">
          {canUpgrade && (
            <button
              id="open-upgrade-modal"
              className="btn btn-primary"
              onClick={() => setShowUpgrade(true)}
            >
              Upgrade plan
            </button>
          )}
          {canCancel && (
            <button
              id="open-cancel-modal"
              className="btn btn-ghost btn-danger-ghost"
              onClick={() => setShowCancel(true)}
            >
              Cancel subscription
            </button>
          )}
        </div>
      </section>

      {/* Billing history */}
      <section className="settings-section" aria-labelledby="billing-history-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 id="billing-history-heading" className="settings-section-title" style={{ margin: 0 }}>Billing history</h2>
          {plan !== 'free' && invoices.length === 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-ghost btn-sm"
              title="Sync payment history from Razorpay"
            >
              {syncing ? 'Syncing…' : '↻ Sync invoices'}
            </button>
          )}
        </div>
        <BillingHistoryTable invoices={invoices} />
      </section>

      {/* Modals */}
      {showUpgrade && (
        <UpgradeModal currentPlan={plan} onClose={() => setShowUpgrade(false)} />
      )}
      {showCancel && (
        <CancelModal onClose={() => setShowCancel(false)} />
      )}
    </div>
  );
}
