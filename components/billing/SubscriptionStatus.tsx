import type { DbSubscription } from '@/lib/types';

interface SubscriptionStatusProps {
  subscription: DbSubscription | null;
  plan:         'free' | 'pro';
}

const STATUS_LABELS: Record<string, string> = {
  active:        'Active',
  past_due:      'Payment failed',
  cancelled:     'Cancelled',
  halted:        'Halted — update payment',
  authenticated: 'Active',   // first payment done, subscription is live
  created:       'Pending',
};

const STATUS_COLORS: Record<string, string> = {
  active:        'var(--healthy)',
  past_due:      'var(--risk-high)',
  cancelled:     'var(--text-muted)',
  halted:        'var(--risk-critical)',
  authenticated: 'var(--healthy)',   // same green as active
  created:       'var(--risk-medium)',
};

export function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: '#475569',
    pro:  '#378ADD',
    team: '#1D9E75',
  };
  return (
    <span
      className="plan-badge"
      style={{ background: colors[plan] ?? '#475569' }}
      aria-label={`Current plan: ${plan}`}
    >
      {plan.toUpperCase()}
    </span>
  );
}

export default function SubscriptionStatus({ subscription, plan }: SubscriptionStatusProps) {
  const status = (subscription?.status ?? 'inactive') as string;
  const renewalDate = subscription?.current_end
    ? new Date(subscription.current_end).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <div className="subscription-status-card">
      <div className="subscription-status-header">
        <div>
          <div className="subscription-status-label">Current plan</div>
          <div className="subscription-status-plan">
            <PlanBadge plan={plan} />
          </div>
        </div>
        {subscription && (
          <div className="subscription-status-badge" style={{ color: STATUS_COLORS[status] ?? '#94A3B8' }}>
            <span className="status-dot" style={{ background: STATUS_COLORS[status] ?? '#94A3B8' }} />
            {STATUS_LABELS[status] ?? status}
          </div>
        )}
      </div>

      {renewalDate && plan !== 'free' && (
        <p className="subscription-renewal">
          {status === 'cancelled' ? 'Access until' : 'Renews'}: <strong>{renewalDate}</strong>
        </p>
      )}

      {status === 'past_due' || status === 'halted' ? (
        <div className="subscription-alert" role="alert">
          ⚠️ Your last payment failed. Please update your payment method to keep Pro access.
          <a href="/api/billing/reactivate-subscription" className="btn btn-primary btn-sm" style={{ marginLeft: '12px' }}>
            Reactivate
          </a>
        </div>
      ) : null}
    </div>
  );
}
