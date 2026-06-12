const TESTIMONIALS = [
  {
    quote: 'DepGraph flagged event-stream 3 weeks before the hijack made headlines. We had already migrated. The predictive score dropped from 82 to 11 overnight — and it caught it.',
    author: 'Arjun S.',
    role: 'Staff Engineer',
    company: 'Razorpay',
    initials: 'AS',
  },
  {
    quote: 'I scanned 600 dependencies in 30 seconds. Immediately knew which 4 to fix this sprint. The score breakdown is the first thing that actually made dependency health legible to my VP.',
    author: 'Priya M.',
    role: 'Engineering Lead',
    company: 'Zepto',
    initials: 'PM',
  },
  {
    quote: 'Finally, a tool that tells me *why* a dependency is risky, not just that it has a CVE number. The abandonment detection caught moment.js before our own audit flagged it.',
    author: 'Dmitri K.',
    role: 'Open-Source Maintainer',
    company: 'Independent',
    initials: 'DK',
  },
  {
    quote: 'We blocked 3 supply chain incidents in Q1 using DepGraph in CI. The GitHub Action PR comments are the best feature — every dev sees the risk before merge.',
    author: 'Sarah T.',
    role: 'DevSecOps Lead',
    company: 'YC S23 Startup',
    initials: 'ST',
  },
  {
    quote: 'The migration recommendations alone saved us 2 weeks of research. We were planning to migrate from request to got manually. DepGraph suggested axios with migration steps in the report.',
    author: 'Rahul V.',
    role: 'Senior Backend Engineer',
    company: 'Cred',
    initials: 'RV',
  },
  {
    quote: 'We ship to 50K users daily. DepGraph is part of our merge checklist now. No PR merges if the health score drops below 60. Non-negotiable.',
    author: 'Jin L.',
    role: 'CTO',
    company: 'YC W24 Startup',
    initials: 'JL',
  },
];

export default function TestimonialsSection() {
  return (
    <section
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
            Testimonials
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#FFFFFF',
              lineHeight: 1.05,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Trusted by developers who ship to production.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="hover-card"
              style={{
                background: '#000000',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Quote */}
              <p
                style={{
                  fontSize: '1rem',
                  color: '#888888',
                  lineHeight: 1.7,
                  flex: 1,
                  fontStyle: 'italic',
                  marginBottom: '2rem',
                }}
              >
                "{t.quote}"
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem' }}>
                <div
                  style={{
                    width: '40px', height: '40px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>{t.author}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.1rem' }}>{t.role} <span style={{ color: '#333333' }}>//</span> {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
