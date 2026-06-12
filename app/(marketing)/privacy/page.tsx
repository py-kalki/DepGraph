import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Privacy Policy — DepGraph',
  description: 'How we handle and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1rem', lineHeight: 1.05 }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#888888', fontSize: '1rem', marginBottom: '4rem', fontFamily: 'JetBrains Mono, monospace' }}>Last Updated: June 1, 2026</p>

        <div style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <p>
            At DepGraph, we take your privacy seriously. This policy describes how we collect, use, and protect your information when you use our CLI, GitHub Action, and Dashboard.
          </p>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>1. Information We Collect</h2>
            <p>We only collect the information necessary to provide our services:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong style={{ color: '#FFFFFF' }}>Account Information:</strong> Name, email address, and GitHub username when you sign in via OAuth.</li>
              <li><strong style={{ color: '#FFFFFF' }}>Repository Data:</strong> We read your <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>package.json</code> and lockfiles to compute health scores. <em style={{ color: '#FFFFFF' }}>We do not store or clone your source code.</em></li>
              <li><strong style={{ color: '#FFFFFF' }}>Usage Data:</strong> Basic telemetry (e.g., CLI invocations, dashboard page views) collected via PostHog to help us improve the product.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
            <p>We use your data solely for the following purposes:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>To provide, maintain, and improve the DepGraph service.</li>
              <li>To process your payments and manage your subscription.</li>
              <li>To send you important alerts, such as critical CVE notifications or weekly digests.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>3. Data Sharing</h2>
            <p>
              We will never sell your data to third parties. We only share data with trusted infrastructure partners (e.g., Vercel, Supabase, Razorpay) strictly necessary for operating the service.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>4. Security</h2>
            <p>
              We implement industry-standard security measures. Your GitHub OAuth tokens are securely encrypted at rest. Our API endpoints require authentication and are rate-limited to prevent abuse.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>privacy@depgraph.vedanshh.dev</code>.
            </p>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
