'use client';

import { useState } from 'react';
import type { DbEmailPreferences } from '@/lib/types';

interface EmailPreferencesProps {
  prefs:    DbEmailPreferences;
  isPro:    boolean;
}

interface Toggle {
  id:      keyof DbEmailPreferences;
  label:   string;
  description: string;
  proOnly: boolean;
}

const TOGGLES: Toggle[] = [
  {
    id:          'score_drop_enabled',
    label:       'Score drop alerts',
    description: 'Email when your project health score drops by more than your threshold.',
    proOnly:     true,
  },
  {
    id:          'new_cve_enabled',
    label:       'New CVE alerts',
    description: 'Email when a new vulnerability is discovered in your dependencies.',
    proOnly:     true,
  },
  {
    id:          'abandonment_enabled',
    label:       'Abandonment risk alerts',
    description: 'Email when a dependency shows signs of being abandoned.',
    proOnly:     true,
  },
  {
    id:          'digest_enabled',
    label:       'Weekly email digest',
    description: 'A weekly summary of score changes across all your saved projects.',
    proOnly:     false,
  },
];

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function EmailPreferences({ prefs, isPro }: EmailPreferencesProps) {
  const [values,  setValues]  = useState({ ...prefs });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleToggle = (id: keyof DbEmailPreferences) => {
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleDigestDay = (day: number) => {
    setValues((prev) => ({ ...prev, digest_day: day }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreDropEnabled:   values.score_drop_enabled,
          newCveEnabled:      values.new_cve_enabled,
          abandonmentEnabled: values.abandonment_enabled,
          digestEnabled:      values.digest_enabled,
          digestDay:          values.digest_day,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="email-preferences">
      <div className="preferences-list" role="group" aria-label="Email notification preferences">
        {TOGGLES.map((toggle) => {
          const disabled = toggle.proOnly && !isPro;
          const val      = values[toggle.id] as boolean;
          return (
            <div key={toggle.id} className={`preference-row ${disabled ? 'preference-row--disabled' : ''}`}>
              <div className="preference-info">
                <label htmlFor={`toggle-${toggle.id}`} className="preference-label">
                  {toggle.label}
                  {toggle.proOnly && !isPro && (
                    <span className="pro-badge" aria-label="Pro plan required">PRO</span>
                  )}
                </label>
                <p className="preference-description">{toggle.description}</p>
              </div>
              <button
                id={`toggle-${toggle.id}`}
                role="switch"
                aria-checked={val}
                aria-label={`${toggle.label} ${val ? 'enabled' : 'disabled'}`}
                className={`toggle-switch ${val ? 'toggle-switch--on' : ''}`}
                onClick={() => !disabled && handleToggle(toggle.id)}
                disabled={disabled}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Digest day selector */}
      {values.digest_enabled && (
        <div className="digest-day-selector">
          <label htmlFor="digest-day-select" className="preference-label">Send digest on</label>
          <select
            id="digest-day-select"
            className="select-input"
            value={values.digest_day}
            onChange={(e) => handleDigestDay(Number(e.target.value))}
          >
            {DAYS.map((day, i) => (
              <option key={day} value={i}>{day}</option>
            ))}
          </select>
        </div>
      )}

      {error  && <p className="form-error" role="alert">{error}</p>}
      {saved  && <p className="form-success" role="status">Preferences saved.</p>}

      <button
        id="save-email-preferences"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  );
}
