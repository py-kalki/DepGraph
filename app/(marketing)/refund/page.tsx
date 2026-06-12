import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Refund Policy — DepGraph',
  description: 'DepGraph refund and cancellation policy.',
};

export default function RefundPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1rem', lineHeight: 1.05 }}>
          Refund Policy
        </h1>
        <p style={{ color: '#888888', fontSize: '1rem', marginBottom: '4rem', fontFamily: 'JetBrains Mono, monospace' }}>Last Updated: June 1, 2026</p>

        <div style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <p>
            At DepGraph, we strive to ensure you are fully satisfied with our service. This policy outlines when refunds are issued.
          </p>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>1. Subscription Cancellations</h2>
            <p>
              You can cancel your subscription at any time from your dashboard. Once cancelled, you will continue to have access to your paid features until the end of your current billing cycle. 
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>2. Refund Eligibility</h2>
            <p>Refunds are strictly issued under the following circumstances:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong style={{ color: '#FFFFFF' }}>First 7 Days:</strong> If you are unsatisfied with your first subscription payment, contact us within 7 days for a full refund.</li>
              <li><strong style={{ color: '#FFFFFF' }}>Accidental Renewals:</strong> If you forgot to cancel before the billing cycle renewed, contact us within 48 hours of the charge for a refund.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>3. Non-refundable Items</h2>
            <p>
              We do not issue refunds for partial months of service if you cancel in the middle of a billing cycle (unless it falls under the 48-hour accidental renewal window). Enterprise contracts are subject to the specific terms outlined in their respective agreements.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>4. How to Request a Refund</h2>
            <p>
              Please send an email to <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>support@depgraph.vedanshh.dev</code> with the email address associated with your account and the reason for the request. We typically process requests within 1-2 business days.
            </p>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
