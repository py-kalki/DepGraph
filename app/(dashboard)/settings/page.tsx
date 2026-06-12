'use client';

import { useState, useEffect } from 'react';
import { KeyRound, Download, Trash2, Mail, BellRing, Copy, Check, CreditCard } from 'lucide-react';
import HoverCardEffect from '@/components/landing/HoverCardEffect';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const res = await fetch('/api/settings/apiKeys');
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/settings/apiKeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    });
    if (res.ok) {
      const data = await res.json();
      setGeneratedKey(data.rawKey);
      setNewKeyName('');
      fetchKeys();
    }
  };

  const handleDeleteKey = async (id: string) => {
    const res = await fetch(`/api/settings/apiKeys?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchKeys();
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportSBOM = () => {
    const mockSbom = {
      bomFormat: "CycloneDX",
      specVersion: "1.4",
      version: 1,
      metadata: { component: { name: "depgraph-project", type: "application" } },
      components: [
        { name: "react", version: "18.2.0", type: "library", bomRef: "pkg:npm/react@18.2.0" }
      ]
    };
    const blob = new Blob([JSON.stringify(mockSbom, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sbom.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem', paddingBottom: '4rem' }}>
      <HoverCardEffect />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Billing & Subscription */}
        <section className="card hover-card" style={{ padding: '2rem', border: '1px solid #1D9E75' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={20} color="#1D9E75" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1D9E75' }}>Billing &amp; Subscription</h2>
            </div>
            <a 
              href="/settings/billing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                background: '#1D9E75',
                color: '#000000',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Manage Plan
            </a>
          </div>
          <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>
            View your current plan, upgrade to Pro, or download past invoices.
          </p>
        </section>

        {/* Alert Thresholds */}
        <section className="card hover-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BellRing size={20} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Alert Thresholds</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#888888' }}>
              <span>Notify on Critical Risk dependencies</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#1D9E75', width: '1.25rem', height: '1.25rem' }} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#888888' }}>
              <span>Notify when project health drops below 50</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#1D9E75', width: '1.25rem', height: '1.25rem' }} />
            </label>
          </div>
        </section>

        {/* Email Preferences */}
        <section className="card hover-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Mail size={20} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Email Preferences</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#888888' }}>
              <span>Weekly Health Report</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#1D9E75', width: '1.25rem', height: '1.25rem' }} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#888888' }}>
              <span>Immediate Vulnerability Alerts</span>
              <input type="checkbox" defaultChecked style={{ accentColor: '#1D9E75', width: '1.25rem', height: '1.25rem' }} />
            </label>
          </div>
        </section>

        {/* CI/CD Tokens */}
        <section className="card hover-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <KeyRound size={20} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>CI/CD Tokens</h2>
          </div>
          <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
            Use these API keys to authenticate the DepGraph CLI in your CI/CD pipelines.
          </p>

          {generatedKey && (
            <div style={{ padding: '1rem', background: 'rgba(29,158,117,0.1)', border: '1px solid #1D9E75', marginBottom: '1.5rem' }}>
              <p style={{ color: '#1D9E75', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                New API Key Generated
              </p>
              <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', marginBottom: '1rem' }}>
                Please copy this key now. It will not be shown again.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <code style={{ flex: 1, padding: '0.5rem 1rem', background: '#000000', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', background: '#FFFFFF', color: '#000000', border: 'none', cursor: 'pointer' }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateKey} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="text"
              required
              placeholder="Key Name (e.g. GitHub Actions)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFFFFF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
            <button
              type="submit"
              style={{
                padding: '0 1.5rem',
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              Generate Key
            </button>
          </form>

          {keys.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase' }}>Prefix</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#FFFFFF' }}>{key.name}</td>
                    <td style={{ padding: '1rem 0', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: '#888888' }}>{key.key_prefix}...</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        style={{ background: 'transparent', border: 'none', color: '#E24B4A', cursor: 'pointer', padding: '0.25rem' }}
                        aria-label="Revoke key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* SBOM Export */}
        <section className="card hover-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Download size={20} color="#FFFFFF" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>SBOM Export</h2>
          </div>
          <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
            Export your project dependencies as a Software Bill of Materials. V1 supports CycloneDX JSON format.
          </p>
          <button
            onClick={handleExportSBOM}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#FFFFFF',
              border: '1px solid #FFFFFF',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#000000'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}
          >
            <Download size={16} />
            Download SBOM (JSON)
          </button>
        </section>

      </div>
    </div>
  );
}
