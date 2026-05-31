const FEATURES = [
  {
    icon: '🔮',
    title: 'Predict abandonment risk',
    description:
      'Health scores computed daily from GitHub commit activity, bus factor, download trends, and CVE counts. Know what will break before it does.',
    color: '#378ADD',
  },
  {
    icon: '🛡️',
    title: 'Protect your supply chain',
    description:
      'Score drops, new CVEs, and abandonment flags trigger real-time alerts. Stay informed without constantly checking.',
    color: '#1D9E75',
  },
  {
    icon: '🔧',
    title: 'Fix with confidence',
    description:
      'Every at-risk package includes migration path suggestions, alternative libraries, and effort estimates.',
    color: '#EF9F27',
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section" aria-labelledby="features-heading">
      <div className="section-container">
        <div className="section-label">How DepGraph works</div>
        <h2 id="features-heading" className="section-title">
          Three pillars of dependency intelligence
        </h2>
        <p className="section-description">
          Unlike reactive tools that only alert after a CVE is published, DepGraph is
          predictive — surfacing risk before it becomes a production emergency.
        </p>

        <div className="features-grid">
          {FEATURES.map((feat) => (
            <article key={feat.title} className="feature-card">
              <div className="feature-icon" style={{ color: feat.color }}>
                {feat.icon}
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-description">{feat.description}</p>
            </article>
          ))}
        </div>

        {/* Score signal breakdown */}
        <div className="score-signals">
          <h3 className="signals-heading">Health score signals</h3>
          <div className="signals-grid">
            {[
              { label: 'Maintenance activity', weight: '25%', icon: '⚡' },
              { label: 'Bus factor',           weight: '20%', icon: '👥' },
              { label: 'Issue health',          weight: '15%', icon: '🐛' },
              { label: 'Download trend',        weight: '15%', icon: '📈' },
              { label: 'Known CVEs',            weight: '15%', icon: '🔐' },
              { label: 'Dep freshness',         weight: '10%', icon: '🌿' },
            ].map((sig) => (
              <div key={sig.label} className="signal-item">
                <span className="signal-icon">{sig.icon}</span>
                <span className="signal-label">{sig.label}</span>
                <span className="signal-weight">{sig.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
