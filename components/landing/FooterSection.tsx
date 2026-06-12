'use client';

import Link from 'next/link';

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'CLI Guide', href: '/docs/cli' },
    { label: 'GitHub Action', href: '/docs/action' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Scoring Methodology', href: '/docs/scoring' },
  ],
  'Open Source': [
    { label: 'GitHub', href: 'https://github.com/py-kalki/DepGraph', external: true },
    { label: 'CLI Scanner', href: 'https://github.com/py-kalki/depgraph-cli', external: true },
    { label: 'GitHub Action', href: 'https://github.com/py-kalki/depgraph-action', external: true },
    { label: 'Contributing', href: '/docs/contributing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/support' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

export default function FooterSection() {
  return (
    <footer
      style={{
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        padding: '5rem 1.5rem 3rem',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Top: Logo + link columns */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: '5rem',
          }}
        >
          {/* Brand */}
          <div style={{ flex: '1 1 300px' }}>
            <Link
              href="/"
              style={{
                display: 'flex', alignItems: 'center',
                textDecoration: 'none', marginBottom: '1.25rem',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                letterSpacing: '-0.04em',
              }}
            >
              <span style={{ fontWeight: 300, fontStyle: 'italic' }}>dep</span>
              <span style={{ fontWeight: 800, fontFamily: 'var(--font-sans)' }}>Graph</span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: '#888888', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '280px' }}>
              Dependency intelligence for developers who care about what ships to production. No fluff, just signals.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }} />
              All systems operational
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '1.25rem',
                }}
              >
                {section}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={'external' in l && l.external ? '_blank' : undefined}
                      rel={'external' in l && l.external ? 'noopener noreferrer' : undefined}
                      style={{
                        fontSize: '0.875rem',
                        color: '#888888',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#888888'; }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 500 }}>
            © {new Date().getFullYear()} DepGraph. Built in public.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 500 }}>
            Powered by{' '}
            <span style={{ color: '#FFFFFF' }}>GitHub API</span>
            {' // '}
            <span style={{ color: '#FFFFFF' }}>npm Registry</span>
            {' // '}
            <span style={{ color: '#FFFFFF' }}>OSV.dev</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
