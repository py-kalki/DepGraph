'use client';

import { useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import HoverCardEffect from '@/components/landing/HoverCardEffect';

// Crosshead corner accent — same as HeroSection
const Crosshead = ({ style }: { style: React.CSSProperties }) => (
  <svg
    width="15" height="15" viewBox="0 0 15 15" fill="none"
    style={{ position: 'absolute', color: 'rgba(255,255,255,0.25)', ...style }}
  >
    <path d="M7.5 0V15M0 7.5H15" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const FREE_FEATURES = [
  'npx depgraph-scanner check on any project',
  'Up to 3 saved projects',
  'Public repositories only',
  'Health scores + risk flags',
  '30-day score history',
  'Weekly email digest',
  'Shareable report URLs',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited saved projects',
  'Public + private repositories',
  '365-day score history',
  'Real-time alerts (score drops, CVEs)',
  'On-demand project re-scan',
  'SBOM export (JSON / CycloneDX)',
  'Migration path suggestions',
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your billing dashboard. You keep Pro access until end of the current billing period.' },
  { q: 'Do you support private repositories?', a: 'Private repos are available on the Pro plan. We use your GitHub OAuth token, which you can revoke at any time.' },
  { q: 'What payment methods are accepted?', a: 'All major credit/debit cards and UPI via Razorpay. Invoices available for download.' },
  { q: 'Is the free tier really free?', a: 'Yes, forever. No credit card required. The free tier includes 3 projects, health scores, and weekly digests.' },
];

export default function PricingPageClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      if (res.status === 401) { window.location.href = '/login?callbackUrl=/pricing'; return; }
      const data = await res.json() as { shortUrl?: string; checkoutUrl?: string; error?: string };
      const url = data.shortUrl ?? data.checkoutUrl;
      if (url) {
        window.location.href = url;
      } else {
        setError(data.error ?? 'Checkout unavailable. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
      <HoverCardEffect />
      <LandingNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '8rem 1.5rem 5rem', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80vw', height: '400px', zIndex: 0,
          background: 'conic-gradient(from 180deg at 50% 100%, #1e3a8a 0deg, #0ea5e9 90deg, #10b981 180deg, #ef4444 270deg, #991b1b 360deg)',
          filter: 'blur(80px)', opacity: 0.35,
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', marginBottom: '2rem',
            padding: '0.3rem 1rem', border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#888888',
          }}>Pricing</div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.05,
            marginBottom: '1.5rem', color: '#FFFFFF',
          }}>
            Start free.<br />Scale when you need to.
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#888888', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
            No hidden fees. Cancel anytime. The free tier is genuinely useful — not a crippled demo.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ────────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 8rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          border: '1px solid rgba(255,255,255,0.12)', position: 'relative',
        }}>
          <Crosshead style={{ top: '-7.5px', left: '-7.5px' }} />
          <Crosshead style={{ top: '-7.5px', right: '-7.5px' }} />
          <Crosshead style={{ bottom: '-7.5px', left: '-7.5px' }} />
          <Crosshead style={{ bottom: '-7.5px', right: '-7.5px' }} />

          {/* FREE */}
          <div className="hover-card" style={{ padding: '3rem', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666666', marginBottom: '1.5rem' }}>Free</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>₹0</span>
              <span style={{ color: '#555555', fontSize: '0.875rem' }}>/forever</span>
            </div>
            <p style={{ color: '#666666', fontSize: '0.8125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>Everything you need to get started.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.8125rem', color: '#A1A1AA' }}>
                  <span style={{ color: '#FFFFFF', flexShrink: 0, marginTop: '0.1em' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" style={{
              display: 'block', textAlign: 'center', padding: '0.875rem 1rem',
              border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', textDecoration: 'none',
              fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >Get started free</Link>
          </div>

          {/* PRO */}
          <div className="hover-card" style={{ padding: '3rem', background: '#080808', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.2rem 0.6rem', border: '1px solid #FFFFFF', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Most popular</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '1.5rem' }}>Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>₹99</span>
              <span style={{ color: '#555555', fontSize: '0.875rem' }}>/month</span>
            </div>
            <p style={{ color: '#888888', fontSize: '0.8125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>For developers serious about dependency health.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {PRO_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.8125rem', color: '#A1A1AA' }}>
                  <span style={{ color: '#FFFFFF', flexShrink: 0, marginTop: '0.1em' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            {error && <p style={{ color: '#E24B4A', fontSize: '0.75rem', marginBottom: '0.75rem' }}>✗ {error}</p>}
            <button onClick={handleUpgrade} disabled={loading} style={{
              display: 'block', width: '100%', textAlign: 'center', padding: '0.875rem 1rem',
              background: '#FFFFFF', color: '#000000', border: '1px solid #FFFFFF',
              fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}>
              {loading ? 'Redirecting…' : 'Start Pro trial →'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 8rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555555', marginBottom: '2rem' }}>Full comparison</div>
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 1.5rem', color: '#555555', fontWeight: 600 }}>Feature</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#555555', fontWeight: 600, textAlign: 'center' }}>Free</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#FFFFFF', fontWeight: 700, textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['CLI scanner', '✓', '✓'],
                  ['Saved projects', '3', 'Unlimited'],
                  ['Private repos', '✗', '✓'],
                  ['Score history', '30 days', '365 days'],
                  ['Real-time alerts', '✗', '✓'],
                  ['On-demand re-scan', '✗', '✓'],
                  ['SBOM export', '✗', 'JSON & CycloneDX'],
                  ['Migration suggestions', '✗', '✓'],
                ].map(([feat, free, pro], i) => (
                  <tr key={feat} style={{ borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <td style={{ padding: '0.875rem 1.5rem', color: '#888888' }}>{feat}</td>
                    <td style={{ padding: '0.875rem 1.5rem', textAlign: 'center', color: free === '✗' ? '#333333' : '#888888' }}>{free}</td>
                    <td style={{ padding: '0.875rem 1.5rem', textAlign: 'center', color: pro === '✗' ? '#333333' : '#FFFFFF', background: 'rgba(255,255,255,0.03)', fontWeight: pro !== '✗' && pro !== '✓' ? 600 : 400 }}>{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 8rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555555', marginBottom: '2rem' }}>FAQ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', border: '1px solid rgba(255,255,255,0.1)' }}>
            {FAQS.map((item, i) => (
              <div key={item.q} className="hover-card" style={{
                padding: '2rem',
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.4 }}>{item.q}</div>
                <div style={{ fontSize: '0.8125rem', color: '#666666', lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '0 1.5rem 10rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '4rem 3rem', position: 'relative' }}>
            <Crosshead style={{ top: '-7.5px', left: '-7.5px' }} />
            <Crosshead style={{ top: '-7.5px', right: '-7.5px' }} />
            <Crosshead style={{ bottom: '-7.5px', left: '-7.5px' }} />
            <Crosshead style={{ bottom: '-7.5px', right: '-7.5px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>Start scanning in 30 seconds.</h2>
            <p style={{ color: '#666666', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>No credit card required. Free forever.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/dashboard" style={{
                padding: '0.875rem 2rem', background: '#FFFFFF', color: '#000000',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.8125rem',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>Get started free →</Link>
              <code style={{ padding: '0.875rem 1.5rem', border: '1px solid rgba(255,255,255,0.15)', color: '#666666', fontSize: '0.8125rem' }}>
                npx depgraph-scanner check
              </code>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
