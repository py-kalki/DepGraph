import type { Metadata } from 'next';
import PricingTable  from '@/components/pricing/PricingTable';
import FooterSection from '@/components/landing/FooterSection';
import LandingNavbar from '@/components/landing/LandingNavbar';

export const metadata: Metadata = {
  title: 'Pricing — DepGraph',
  description:
    'Start free with 3 saved projects. Upgrade to Pro for unlimited projects, private repos, and real-time alerts.',
};

export default function PricingPage() {
  return (
    <>
      <LandingNavbar />
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div style={{ display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--brand-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Pricing
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
            Simple, transparent <span className="hero-title-accent">pricing</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            No hidden fees. Cancel anytime. The free tier is genuinely useful — not a crippled demo.
          </p>
        </section>

        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          <PricingTable />

          <div style={{ marginTop: '8rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '3rem' }}>Frequently asked questions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
                <div key={q} className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>{q}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{a}</p>
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
