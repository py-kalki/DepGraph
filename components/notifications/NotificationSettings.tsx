'use client';

import { useState } from 'react';
import AlertCard from './AlertCard';
import EmailPreferences from './EmailPreferences';
import type { DbAlertSubscription, DbEmailPreferences } from '@/lib/types';

interface NotificationSettingsProps {
  alerts: DbAlertSubscription[];
  prefs:  DbEmailPreferences;
  isPro:  boolean;
}

export default function NotificationSettings({ alerts: initialAlerts, prefs, isPro }: NotificationSettingsProps) {
  const [alerts, setAlerts] = useState(initialAlerts);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="notification-settings">
      <div className="settings-page-header">
        <h1 className="settings-page-title">Notification Settings</h1>
        <p className="settings-page-description">
          Configure when and how you receive alerts about your project dependencies.
        </p>
      </div>

      {/* Email preferences */}
      <section className="settings-section" aria-labelledby="email-prefs-heading">
        <h2 id="email-prefs-heading" className="settings-section-title">Email preferences</h2>
        <EmailPreferences prefs={prefs} isPro={isPro} />
      </section>

      {/* Active alerts */}
      <section className="settings-section" aria-labelledby="active-alerts-heading">
        <h2 id="active-alerts-heading" className="settings-section-title">Active alert subscriptions</h2>

        {alerts.length === 0 ? (
          <div className="empty-state" role="status">
            <p className="empty-state-text">No alert subscriptions yet.</p>
            <p className="empty-state-hint">
              {isPro
                ? 'Add alerts from your project dashboard.'
                : 'Upgrade to Pro to create real-time score drop and CVE alerts.'}
            </p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
