import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'About Us — DepGraph',
  description: 'The story and mission behind DepGraph. We build tools for the paranoid to solve the software supply chain crisis.',
  keywords: ['About DepGraph', 'security researchers', 'open-source veterans', 'supply chain crisis', 'DepGraph mission'],
  openGraph: {
    title: 'About Us — DepGraph',
    description: 'The story and mission behind DepGraph. We build tools for the paranoid to solve the software supply chain crisis.',
    type: 'website',
    url: 'https://depgraph.vedanshh.dev/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — DepGraph',
    description: 'The story and mission behind DepGraph. We build tools for the paranoid.',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
          We build tools for the paranoid.
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#888888', lineHeight: 1.6, marginBottom: '4rem', maxWidth: '700px' }}>
          DepGraph is a team of security researchers and open-source veterans dedicated to solving the software supply chain crisis before it happens.
        </p>

        <div style={{ fontSize: '1rem', color: '#888888', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>The Problem</h2>
            <p style={{ marginBottom: '1rem' }}>
              Modern software is built on a house of cards. A standard React application pulls in over 1,000 transitive dependencies, maintained by anonymous volunteers across the globe. 
            </p>
            <p>
              Tools like Dependabot and Snyk only alert you <em>after</em> a vulnerability is published. By that time, it's already a crisis. You are reacting, not predicting.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Our Mission</h2>
            <p>
              We believe dependency management should be predictive. We ingest billions of data points—commit velocity, issue resolution times, maintainer overlap, and historical trends—to score the health of every package in the npm registry.
            </p>
            <p style={{ marginTop: '1rem' }}>
              We warn you when a critical transitive dependency is quietly abandoned, months before the first CVE is filed.
            </p>
          </div>

          <div style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Built for scale.</h2>
            <p>
              Headquartered entirely on the internet, our systems analyze over 4 million packages daily. We are funded by engineers, for engineers.
            </p>
            <p style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <strong>Founded by <a href="https://www.vedanshh.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Vedansh Danot</a>.</strong>
            </p>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
