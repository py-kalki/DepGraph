import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Terms of Service — DepGraph',
  description: 'Terms and conditions for using DepGraph.',
};

export default function TermsPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last Updated: June 1, 2026</p>
        </section>

        <div className="container docs-prose glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          
          <p>
            By accessing or using DepGraph, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2>1. Use of Service</h2>
          <p>
            DepGraph provides dependency intelligence, scoring, and alerting. You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for safeguarding the password and API keys that you use to access the service.
          </p>

          <h2>2. Subscriptions and Billing</h2>
          <p>
            Some aspects of the service are billed on a subscription basis. You will be billed in advance on a recurring schedule. You may cancel your subscription at any time via the billing dashboard, but no refunds will be provided for partial months.
          </p>

          <h2>3. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by DepGraph and are protected by international copyright and trademark laws. You may not copy, modify, or distribute our intellectual property without prior written consent.
          </p>

          <h2>4. Limitation of Liability</h2>
          <p>
            In no event shall DepGraph, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. DepGraph's health scores are predictive and provided "as is" without warranty of any kind.
          </p>

          <h2>5. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes via email or dashboard notification prior to the changes taking effect.
          </p>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
