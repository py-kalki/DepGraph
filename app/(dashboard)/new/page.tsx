'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus } from 'lucide-react';
import HoverCardEffect from '@/components/landing/HoverCardEffect';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, githubRepo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <HoverCardEffect />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add New Project</h1>
        <p style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
          Connect a GitHub repository or create an empty project for CLI scanning.
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
              placeholder="e.g. My Frontend App"
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
              GitHub Repository (Optional)
            </label>
            <input
              id="githubRepo"
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo"
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
              Leave blank if you plan to scan locally via CLI.
            </p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
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
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.opacity = '1' }}
            >
              <PackagePlus size={16} />
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
