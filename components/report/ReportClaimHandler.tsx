'use client';

// =============================================================================
// ReportClaimHandler — auto-claims orphan scan reports for authenticated users.
// Fires once on mount when: user is logged in AND report has no project_id.
// Shows a brief "Saved to dashboard" notice.
// =============================================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  shareToken: string;
  isOrphan: boolean; // report.project_id === null
}

export function ReportClaimHandler({ shareToken, isOrphan }: Props) {
  const [status, setStatus] = useState<'idle' | 'claiming' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!isOrphan) return; // already linked, nothing to do

    setStatus('claiming');

    fetch(`/api/reports/${shareToken}/claim`, { method: 'POST' })
      .then((res) => {
        if (res.ok) setStatus('saved');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [shareToken, isOrphan]);

  if (status === 'idle' || (!isOrphan && status !== 'saved')) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      padding: '1rem 1.25rem',
      background: status === 'saved' ? 'rgba(29,158,117,0.12)' : 'rgba(226,75,74,0.12)',
      border: `1px solid ${status === 'saved' ? '#1D9E75' : '#E24B4A'}`,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.8125rem',
      color: '#FFFFFF',
      maxWidth: '340px',
      animation: 'slideIn 0.3s ease',
    }}>
      {status === 'claiming' && (
        <>
          <span style={{ color: '#888888' }}>Saving report to your dashboard…</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <span style={{ color: '#1D9E75', fontSize: '1rem' }}>✓</span>
          <span>
            Report saved!{' '}
            <Link href="/dashboard" style={{ color: '#1D9E75', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              View Dashboard →
            </Link>
          </span>
        </>
      )}
      {status === 'error' && (
        <span style={{ color: '#E24B4A' }}>Could not save report — try again from your dashboard.</span>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
