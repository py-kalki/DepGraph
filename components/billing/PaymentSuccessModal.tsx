'use client';

// =============================================================================
// PaymentSuccessModal — shown after successful Razorpay payment
// Includes confetti burst, plan confirmation, and invoice download
// =============================================================================

import { useEffect, useState } from 'react';

interface Props {
  paymentId: string;
  onClose: () => void;
}

export default function PaymentSuccessModal({ paymentId, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; angle: number; speed: number }[]>([]);

  // Generate confetti particles on mount
  useEffect(() => {
    const colors = ['#FFFFFF', '#1D9E75', '#0ea5e9', '#f59e0b', '#ef4444'];
    setParticles(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        speed: 0.5 + Math.random() * 1.5,
      }))
    );
  }, []);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/billing/invoice/${paymentId}`);
      if (!res.ok) throw new Error('Failed to generate invoice');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `depgraph-invoice-${paymentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open print dialog with invoice HTML
      window.open(`/api/billing/invoice/${paymentId}?format=html`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Confetti particles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '6px', height: '6px',
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animation: `confettiFall ${p.speed + 1.5}s ease-out ${i * 0.05}s forwards`,
            transform: `rotate(${p.angle}deg)`,
          }} />
        ))}
      </div>

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'all',
          background: '#000000',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '3rem',
          maxWidth: '480px', width: '100%',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          position: 'relative',
          animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'transparent', border: 'none',
              color: '#555555', fontSize: '1rem', cursor: 'pointer',
            }}
          >✕</button>

          {/* Big checkmark */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '2px solid #1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>
            Payment successful
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Welcome to Pro! 🎉
          </h2>

          <p style={{ color: '#888888', fontSize: '0.8125rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Your account has been upgraded. You now have access to unlimited projects, private repos, real-time alerts, and all Pro features.
          </p>

          {/* Payment ID */}
          <div style={{
            padding: '0.75rem 1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '1.5rem',
            fontSize: '0.75rem', color: '#555555',
            textAlign: 'left',
          }}>
            <span style={{ color: '#444444' }}>Payment ID: </span>
            <span style={{ color: '#888888' }}>{paymentId}</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              style={{
                padding: '0.875rem 1rem',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: '#FFFFFF',
                fontSize: '0.8125rem', fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                cursor: downloading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.2s',
                opacity: downloading ? 0.6 : 1,
              }}
              onMouseOver={e => { if (!downloading) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {downloading ? (
                <>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #555', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Download Invoice PDF
                </>
              )}
            </button>

            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              style={{
                padding: '0.875rem 1rem',
                background: '#FFFFFF', color: '#000000',
                border: '1px solid #FFFFFF',
                fontSize: '0.8125rem', fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes popIn { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes confettiFall { from { opacity: 1; transform: translateY(0) rotate(0deg) } to { opacity: 0; transform: translateY(200px) rotate(720deg) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
