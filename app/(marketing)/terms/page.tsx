import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Terms of Service — DepGraph',
  description: 'Terms and conditions for using DepGraph.',
};

export default function TermsPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1rem', lineHeight: 1.05 }}>
          Terms of Service
        </h1>
        <p style={{ color: '#888888', fontSize: '1rem', marginBottom: '4rem', fontFamily: 'JetBrains Mono, monospace' }}>Last Updated: June 1, 2026</p>

        <div style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <p>
            By accessing or using DepGraph, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>1. Use of Service</h2>
            <p>
              DepGraph provides dependency intelligence, scoring, and alerting. You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for safeguarding the password and API keys that you use to access the service.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>2. Subscriptions and Billing</h2>
            <p>
              Some aspects of the service are billed on a subscription basis. You will be billed in advance on a recurring schedule. You may cancel your subscription at any time via the billing dashboard, but no refunds will be provided for partial months.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>3. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by DepGraph and are protected by international copyright and trademark laws. You may not copy, modify, or distribute our intellectual property without prior written consent.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>4. Limitation of Liability</h2>
            <p>
              In no event shall DepGraph, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. DepGraph's health scores are predictive and provided "as is" without warranty of any kind.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>5. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes via email or dashboard notification prior to the changes taking effect.
            </p>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
