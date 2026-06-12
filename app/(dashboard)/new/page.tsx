'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import HoverCardEffect from '@/components/landing/HoverCardEffect';

type Phase = 'idle' | 'creating' | 'scanning' | 'done' | 'error';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const loading = phase === 'creating' || phase === 'scanning';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('creating');
    setError(null);

    try {
      // Step 1: Create the project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, githubRepo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      const project = data.project;

      // Step 2: If a GitHub repo was provided, trigger an automatic scan
      if (githubRepo?.trim()) {
        setPhase('scanning');

        const scanRes = await fetch('/api/projects/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project.id, githubRepo: project.github_repo }),
        });

        if (!scanRes.ok) {
          // Non-fatal — still redirect even if scan fails
          console.warn('Auto-scan failed, redirecting anyway');
        }
      }

      setPhase('done');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 800);

    } catch (err: any) {
      setError(err.message);
      setPhase('error');
    }
  };

  const statusLabel = () => {
    if (phase === 'creating') return 'Creating project…';
    if (phase === 'scanning') return 'Scanning dependencies…';
    if (phase === 'done') return '✓ Done! Redirecting…';
    return githubRepo.trim() ? 'Create & Scan Project' : 'Create Project';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <HoverCardEffect />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '1.5rem',
          background: 'transparent',
          border: 'none',
          color: '#888888',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          padding: '0.25rem 0',
          transition: 'color 0.15s',
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF' }}
        onMouseOut={(e) => { e.currentTarget.style.color = '#888888' }}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add New Project</h1>
        <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
          Connect a GitHub repository to auto-scan, or create an empty project for CLI scanning.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(226,75,74,0.1)',
          border: '1px solid #E24B4A',
          color: '#E24B4A',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8125rem',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      <div className="card hover-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Project Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MelodyFetch"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFFFFF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="githubRepo" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GitHub Repository <span style={{ color: '#666666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — auto-scans on create)</span>
            </label>
            <input
              id="githubRepo"
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo  e.g. py-kalki/MelodyFetch"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFFFFF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
            <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.25rem' }}>
              Leave blank to scan locally with <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.3rem' }}>npx depgraph-scanner check</code>
            </p>
          </div>

          {/* Progress indicator when scanning */}
          {(phase === 'creating' || phase === 'scanning' || phase === 'done') && (
            <div style={{
              padding: '1rem',
              background: 'rgba(29,158,117,0.08)',
              border: '1px solid rgba(29,158,117,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
            }}>
              {phase === 'done'
                ? <CheckCircle size={16} color="#1D9E75" />
                : <Loader2 size={16} color="#1D9E75" style={{ animation: 'spin 1s linear infinite' }} />
              }
              <span style={{ color: phase === 'done' ? '#1D9E75' : '#888888' }}>
                {phase === 'creating' && 'Creating project…'}
                {phase === 'scanning' && 'Scanning dependencies from GitHub…'}
                {phase === 'done' && 'Report ready! Redirecting to dashboard…'}
              </span>
            </div>
          )}

          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading || phase === 'done'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading || phase === 'done' ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <PackagePlus size={16} />
              {statusLabel()}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
