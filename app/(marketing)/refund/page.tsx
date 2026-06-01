import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Refund Policy — DepGraph',
  description: 'Our refund policy for subscription plans.',
};

export default function RefundPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Refund Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last Updated: June 1, 2026</p>
        </section>

        <div className="container docs-prose glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          
          <p>
            At DepGraph, we want to ensure you are fully satisfied with our dependency intelligence platform. This policy outlines the conditions under which refunds are provided.
          </p>

          <h2>1. Monthly Subscriptions</h2>
          <p>
            All monthly subscriptions are billed in advance on a month-to-month basis and are <strong>non-refundable</strong>. There are no refunds or credits for partial months of service, upgrade/downgrade refunds, or refunds for months unused with an open account.
          </p>

          <h2>2. Annual Subscriptions</h2>
          <p>
            For annual plans, we offer a <strong>14-day money-back guarantee</strong>. If you are dissatisfied with the service within the first 14 days of your initial annual subscription, please contact us for a full refund. After 14 days, annual subscriptions are non-refundable.
          </p>

          <h2>3. Service Disruptions</h2>
          <p>
            In the highly unlikely event of a prolonged service outage (defined as continuous downtime exceeding 48 hours), DepGraph may, at its sole discretion, issue prorated service credits to affected accounts. Cash refunds will not be provided for service disruptions.
          </p>

          <h2>4. Cancellations</h2>
          <p>
            You may cancel your subscription at any time via your billing dashboard. Upon cancellation, your service will remain active until the end of your current paid billing period. You will not be charged again, but no refunds will be issued for the remainder of the period.
          </p>

          <h2>5. How to Request a Refund</h2>
          <p>
            If you believe you qualify for a refund under this policy (e.g., within the 14-day window for annual plans), please email us at <code>vedanshh.dev@gmail.com</code> with your account details and the reason for your request.
          </p>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
