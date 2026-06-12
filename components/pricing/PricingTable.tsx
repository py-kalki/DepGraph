import PricingCard from './PricingCard';

const PLANS = [
  {
    plan:        'free'  as const,
    name:        'Free',
    price:       'Free',
    description: 'Everything you need to get started.',
    cta:         'Get started',
    ctaHref:     '/dashboard',
    features: [
      'npx depgraph-scanner check on any public project',
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
    badge:       '★ Most popular',
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

export default function PricingTable() {
  return (
    <section className="pricing-table-section" aria-label="Pricing plans">
      <div className="pricing-cards-grid">
        {PLANS.map((plan) => (
          <PricingCard key={plan.plan} {...plan} />
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="feature-comparison" role="region" aria-label="Feature comparison table">
        <h3 className="comparison-heading">Full feature comparison</h3>
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col" className="comparison-feature-col">Feature</th>
                <th scope="col">Free</th>
                <th scope="col" className="comparison-col--highlighted">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['CLI scanner',            '✓', '✓'],
                ['Saved projects',         '3', 'Unlimited'],
                ['Private repos',          '✗', '✓'],
                ['Score history',          '30 days', '365 days'],
                ['Real-time alerts',       '✗', '✓'],
                ['On-demand re-scan',      '✗', '✓'],
                ['SBOM export',            '✗', 'JSON & CycloneDX'],
                ['Migration suggestions',  '✗', '✓'],
              ].map(([feat, free, pro]) => (
                <tr key={feat}>
                  <th scope="row" className="comparison-feature-name">{feat}</th>
                  <td>{free}</td>
                  <td className="comparison-col--highlighted">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
