import type { Metadata } from 'next';
import PricingTable  from '@/components/pricing/PricingTable';
import FooterSection from '@/components/landing/FooterSection';
import Link          from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — DepGraph',
  description:
    'Start free with 3 saved projects. Upgrade to Pro for unlimited projects, private repos, and real-time alerts.',
};

export default function PricingPage() {
  return (
    <>
      <main id="main-content" className="pricing-page">
        <div className="section-container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep" aria-hidden="true"> / </span>
            <span aria-current="page">Pricing</span>
          </nav>

          <div className="section-label">Pricing</div>
          <h1 className="section-title" style={{ fontSize: '2.5rem' }}>
            Simple, transparent pricing
          </h1>
          <p className="section-description">
            No hidden fees. Cancel anytime. The free tier is genuinely useful —
            not a crippled demo.
          </p>

          <PricingTable />

          <div className="pricing-faq">
            <h2 className="faq-heading">Frequently asked questions</h2>
            <div className="faq-grid">
              {[
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes. Cancel from your billing dashboard at any time. You keep Pro access until the end of your current billing period.',
                },
                {
                  q: 'Do you support private repositories?',
                  a: 'Private repos are available on Pro and Team plans. We use your GitHub OAuth token, which you can revoke at any time.',
                },
                {
                  q: 'What payment methods are accepted?',
                  a: 'We accept all major credit/debit cards and UPI via Razorpay. Invoices are available for download.',
                },
                {
                  q: 'Is the free tier really free?',
                  a: 'Yes, forever. No credit card required. The free tier includes 3 saved projects, health scores, and weekly digests.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="faq-item">
                  <h3 className="faq-question">{q}</h3>
                  <p className="faq-answer">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
