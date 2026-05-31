const STATS = [
  { value: '2.4M+',  label: 'Packages scored' },
  { value: '18,000+', label: 'Risks detected this week' },
  { value: '94%',    label: 'Accuracy on known-abandoned packages' },
];

const TESTIMONIALS = [
  {
    quote: '"DepGraph flagged event-stream 3 weeks before the hijack made headlines. I\'d already migrated."',
    author: 'Arjun S.',
    role:   'Senior Engineer, Bangalore',
  },
  {
    quote: '"I scanned 600 dependencies in 30 seconds and immediately knew which 4 to fix this sprint."',
    author: 'Priya M.',
    role:   'Engineering Lead, Mumbai',
  },
  {
    quote: '"Finally, a tool that tells me *why* a dependency is risky, not just that it has a CVE."',
    author: 'Dmitri K.',
    role:   'Open-Source Maintainer',
  },
];

export default function SocialProofSection() {
  return (
    <section className="social-proof-section" aria-labelledby="social-proof-heading">
      <div className="section-container">
        {/* Stats */}
        <div className="stats-grid" role="list">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card" role="listitem">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 id="social-proof-heading" className="section-title" style={{ marginTop: '4rem' }}>
          Trusted by developers who care about reliability
        </h2>

        {/* Testimonials */}
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.author} className="testimonial-card">
              <p className="testimonial-quote">{t.quote}</p>
              <footer className="testimonial-footer">
                <strong className="testimonial-author">{t.author}</strong>
                <span className="testimonial-role">{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
