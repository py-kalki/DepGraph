'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'How are health scores calculated?',
    a: 'Each package receives a 0–100 composite score weighted across 6 dimensions: maintenance activity (25%), bus factor (20%), issue health (15%), download trend (15%), known CVEs (15%), and dependency freshness (10%). Scores are recalculated daily.',
  },
  {
    q: 'Does this work with private repositories?',
    a: 'Public repos and npm packages are fully supported on the Free tier. Private repository scanning requires a Pro plan, which uses a GitHub App installation with read-only access. We never store your source code.',
  },
  {
    q: 'Can I use DepGraph in CI/CD?',
    a: 'Yes. The GitHub Action integrates in one step. You can fail builds on critical risk, set minimum score thresholds, and post detailed PR comments. GitLab CI and other pipelines work via the CLI.',
  },
  {
    q: 'What data do you store?',
    a: 'We store package metadata, health scores, and scan history. We never store your source code, private tokens, or environment variables. Scan results for private repos are stored encrypted and deleted on account closure.',
  },
  {
    q: 'How accurate is the abandonment detection?',
    a: 'In backtesting against 200 known-abandoned packages, our model achieved 94% recall with 87% precision at the 6-month horizon. False positives are surfaced as "maintenance warnings" rather than critical flags.',
  },
  {
    q: 'Is DepGraph open source?',
    a: 'The CLI scanner and scoring engine are fully open source on GitHub under MIT license. The dashboard and API backend are proprietary. You can self-host the scanner in your own infrastructure.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        padding: '8rem 1.5rem',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
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
            FAQ
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
            }}
          >
            Frequently asked questions.
          </h2>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2rem 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: isOpen ? '#FFFFFF' : '#888888',
                      letterSpacing: '-0.02em',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: isOpen ? '#FFFFFF' : '#666666',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'all 0.2s ease',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      marginLeft: '1rem',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? '200px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p
                    style={{
                      paddingBottom: '2rem',
                      fontSize: '1.0625rem',
                      color: '#888888',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
