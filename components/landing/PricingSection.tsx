'use client';

import Link from 'next/link';

const PLANS = [
  {
    plan:        'free'  as const,
    name:        'Free',
    price:       '₹0',
    period:      '/forever',
    description: 'Everything you need to get started.',
    cta:         'Get started',
    ctaHref:     '/dashboard',
    highlighted: false,
    features: [
      'npx depgraph check on any public project',
      'Up to 3 saved projects',
      'Public repositories only',
      'Health scores + basic risk flags',
      '30-day score history',
      'Weekly email digest',
      'Shareable report URLs',
    ],
  },
  {
    plan:        'pro'   as const,
    name:        'Pro',
    price:       '₹99',
    period:      '/month',
    description: 'For developers serious about dependency health.',
    cta:         'Start Pro trial',
    ctaHref:     '/api/billing/create-subscription?plan=pro',
    highlighted: true,
    badge:       'Most popular',
    features: [
      'Everything in Free',
      'Unlimited saved projects',
      'Public + private repositories',
      '365-day score history',
      'Real-time alerts (score drops, CVEs)',
      'On-demand project re-scan',
      'SBOM export (JSON/CycloneDX)',
      'Migration path suggestions',
    ],
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        padding: '8rem 1.5rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.875rem',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#888888',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            Pricing
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
              marginBottom: '1.25rem',
            }}
          >
            Start free. No credit card required.
          </h2>
          <p style={{ color: '#888888', fontSize: '1.125rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            The free tier is genuinely useful — not crippled. Upgrade to Pro when your project needs more.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.plan}
              className="hover-card"
              style={{
                background: plan.highlighted ? '#0A0A0A' : '#000000',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    padding: '0.25rem 0.75rem',
                    border: '1px solid #FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  {plan.name}
                </div>
                <div style={{ color: '#888888', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {plan.description}
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {plan.price}
                </span>
                <span style={{ color: '#666666', fontWeight: 500 }}>
                  {plan.period}
                </span>
              </div>

              <div style={{ marginBottom: '3rem', flex: 1 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span style={{ color: '#A1A1AA', fontSize: '0.875rem', lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaHref}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '1rem',
                  background: plan.highlighted ? '#FFFFFF' : 'transparent',
                  color: plan.highlighted ? '#000000' : '#FFFFFF',
                  border: '1px solid #FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!plan.highlighted) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!plan.highlighted) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
