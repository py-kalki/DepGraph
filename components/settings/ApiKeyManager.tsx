'use client';

import { useState } from 'react';

type ApiKey = {
  id:          string;
  key_prefix:  string;
  name:        string;
  last_used_at: string | null;
  created_at:  string;
};

type ApiKeyManagerProps = {
  initialKeys: ApiKey[];
  plan:        string;
};

export default function ApiKeyManager({ initialKeys, plan }: ApiKeyManagerProps) {
  const [keys, setKeys]         = useState<ApiKey[]>(initialKeys);
  const [newKeyName, setName]   = useState('');
  const [rawKey, setRawKey]     = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const isPro = plan === 'pro' || plan === 'team';

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isPro) return;
    setCreating(true);
    setError(null);
    setRawKey(null);
    try {
      const res = await fetch('/api/user/api-keys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: newKeyName || 'Default' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setRawKey(data.raw_key);
      setKeys((prev) => [{ ...data, raw_key: undefined }, ...prev]);
      setName('');
    } catch {
      setError('Failed to create API key. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Revoke this API key? Any integrations using it will stop working.')) return;
    const res = await fetch(`/api/user/api-keys/${id}`, { method: 'DELETE' });
    if (res.ok) setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="api-key-manager">
      <div className="api-key-header">
        <h2>API Keys</h2>
        <p>
          Use these keys to authenticate the <code>depgraph/action</code> GitHub Action.
          Keys are shown once — copy them immediately.
        </p>
      </div>

      {!isPro && (
        <div className="api-key-upgrade-banner">
          <span>🔒</span>
          <span>API keys require a <strong>Pro or Team</strong> plan. </span>
          <a href="/pricing">Upgrade</a>
        </div>
      )}

      {rawKey && (
        <div className="api-key-reveal">
          <p>✅ Copy your new API key now — it will not be shown again.</p>
          <div className="api-key-value">
            <code>{rawKey}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(rawKey); }}
              className="btn-copy"
            >
              Copy
            </button>
          </div>
          <button className="btn-dismiss" onClick={() => setRawKey(null)}>Dismiss</button>
        </div>
      )}

      {error && <div className="api-key-error">{error}</div>}

      {isPro && (
        <form onSubmit={handleCreate} className="api-key-create-form">
          <input
            type="text"
            placeholder="Key name (e.g. CI / Production)"
            value={newKeyName}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            className="input-field"
          />
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? 'Generating…' : '+ Generate Key'}
          </button>
        </form>
      )}

      {keys.length === 0 ? (
        <div className="api-key-empty">
          No API keys yet. Generate one above to use with the GitHub Action.
        </div>
      ) : (
        <div className="api-key-list">
          {keys.map((key) => (
            <div key={key.id} className="api-key-row">
              <div className="api-key-info">
                <span className="api-key-name">{key.name}</span>
                <code className="api-key-prefix">{key.key_prefix}••••••••</code>
              </div>
              <div className="api-key-meta">
                <span className="api-key-date">
                  Created {new Date(key.created_at).toLocaleDateString()}
                </span>
                {key.last_used_at && (
                  <span className="api-key-used">
                    Last used {new Date(key.last_used_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(key.id)}
                className="btn-danger-sm"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
