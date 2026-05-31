import PricingTable from '@/components/pricing/PricingTable';

export default function PricingSection() {
  return (
    <section id="pricing" className="pricing-section" aria-labelledby="pricing-heading">
      <div className="section-container">
        <div className="section-label">Pricing</div>
        <h2 id="pricing-heading" className="section-title">
          Start free. Upgrade when you need more.
        </h2>
        <p className="section-description">
          The free tier is genuinely useful — not crippled. Upgrade to Pro when you need
          private repos, real-time alerts, or 365-day history.
        </p>
        <PricingTable />
      </div>
    </section>
  );
}
