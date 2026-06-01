import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Privacy Policy — DepGraph',
  description: 'How we handle and protect your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '8rem' }}>
        <div className="bg-radial-glow"></div>
        
        <section style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last Updated: June 1, 2026</p>
        </section>

        <div className="container docs-prose glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem' }}>
          
          <p>
            At DepGraph, we take your privacy seriously. This policy describes how we collect, use, and protect your information when you use our CLI, GitHub Action, and Dashboard.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We only collect the information necessary to provide our services:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and GitHub username when you sign in via OAuth.</li>
            <li><strong>Repository Data:</strong> We read your <code>package.json</code> and lockfiles to compute health scores. <em>We do not store or clone your source code.</em></li>
            <li><strong>Usage Data:</strong> Basic telemetry (e.g., CLI invocations, dashboard page views) collected via PostHog to help us improve the product.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your data solely for the following purposes:</p>
          <ul>
            <li>To provide, maintain, and improve the DepGraph service.</li>
            <li>To process your payments and manage your subscription.</li>
            <li>To send you important alerts, such as critical CVE notifications or weekly digests.</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We will never sell your data to third parties. We only share data with trusted infrastructure partners (e.g., Vercel, Supabase, Razorpay) strictly necessary for operating the service.
          </p>

          <h2>4. Security</h2>
          <p>
            We implement industry-standard security measures. Your GitHub OAuth tokens are securely encrypted at rest. Our API endpoints require authentication and are rate-limited to prevent abuse.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <code>privacy@depgraph.vedanshh.dev</code>.
          </p>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
