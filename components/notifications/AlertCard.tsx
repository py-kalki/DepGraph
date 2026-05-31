import type { DbAlertSubscription } from '@/lib/types';

interface AlertCardProps {
  alert:    DbAlertSubscription;
  onDelete: (id: string) => void;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  score_drop:       '📉 Score drop',
  new_cve:          '🔴 New CVE',
  abandonment_risk: '⚡ Abandonment risk',
  digest:           '📊 Weekly digest',
};

export default function AlertCard({ alert, onDelete }: AlertCardProps) {
  return (
    <article className="alert-card" aria-label={`Alert: ${ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}`}>
      <div className="alert-card-header">
        <span className="alert-type-badge">
          {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
        </span>
        <span className={`alert-status ${alert.is_active ? 'alert-status--active' : 'alert-status--paused'}`}>
          {alert.is_active ? 'Active' : 'Paused'}
        </span>
      </div>

      <dl className="alert-card-details">
        <div className="alert-detail-row">
          <dt>Destination</dt>
          <dd className="alert-destination">{alert.destination}</dd>
        </div>
        {alert.threshold !== null && (
          <div className="alert-detail-row">
            <dt>Threshold</dt>
            <dd>Score drop ≥ {alert.threshold} points</dd>
          </div>
        )}
        <div className="alert-detail-row">
          <dt>Channel</dt>
          <dd>{alert.channel}</dd>
        </div>
      </dl>

      <div className="alert-card-actions">
        <button
          className="btn btn-ghost btn-sm"
          id={`delete-alert-${alert.id}`}
          onClick={() => onDelete(alert.id)}
          aria-label={`Delete ${ALERT_TYPE_LABELS[alert.alert_type]} alert`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
