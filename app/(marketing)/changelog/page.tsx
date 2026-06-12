import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';

export const metadata = {
  title: 'Changelog — DepGraph',
  description: 'Recent updates, improvements, and fixes to DepGraph.',
};

export default function ChangelogPage() {
  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingNavbar />
      
      <main style={{ flex: 1, padding: '8rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
          Changelog
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#888888', lineHeight: 1.6, marginBottom: '4rem', maxWidth: '700px' }}>
          New updates and improvements to the DepGraph platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          
          {/* Release Entry */}
          <article style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-5px', top: '6px', width: '9px', height: '9px', background: '#FFFFFF', borderRadius: '50%' }}></div>
            <header style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace', color: '#888888', marginBottom: '0.5rem' }}>June 10, 2026</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>CLI v1.2: Deep Transitive Analysis</h2>
            </header>
            <div style={{ color: '#888888', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '1rem' }}>We've completely rewritten our CLI scanning engine to support ultra-deep dependency resolution. You can now specify <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>--depth infinity</code> to crawl your entire lockfile without performance degradation.</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong style={{ color: '#FFFFFF' }}>Added:</strong> <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>--format json</code> flag for CI integrations.</li>
                <li><strong style={{ color: '#FFFFFF' }}>Improved:</strong> Scan speeds are now 4x faster thanks to aggressively batched API resolution.</li>
                <li><strong style={{ color: '#FFFFFF' }}>Fixed:</strong> Resolved an issue where yarn v3 workspaces were not detected properly.</li>
              </ul>
            </div>
          </article>

          {/* Release Entry */}
          <article style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-5px', top: '6px', width: '9px', height: '9px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }}></div>
            <header style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace', color: '#888888', marginBottom: '0.5rem' }}>May 24, 2026</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>New GitHub Action & API Keys</h2>
            </header>
            <div style={{ color: '#888888', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '1rem' }}>DepGraph can now block PRs that introduce abandoned or malicious packages.</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong style={{ color: '#FFFFFF' }}>Added:</strong> Official GitHub Action <code style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }}>py-kalki/depgraph-action@v1</code> available in the marketplace.</li>
                <li><strong style={{ color: '#FFFFFF' }}>Added:</strong> Dashboard UI to generate and revoke API keys (Pro/Team plans).</li>
              </ul>
            </div>
          </article>

          {/* Release Entry */}
          <article style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-5px', top: '6px', width: '9px', height: '9px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }}></div>
            <header style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace', color: '#888888', marginBottom: '0.5rem' }}>May 1, 2026</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>Public Beta Launch</h2>
            </header>
            <div style={{ color: '#888888', lineHeight: 1.7 }}>
              <p>DepGraph is officially open to the public. We're launching with a fully functional dashboard, GitHub OAuth integration, and real-time package scoring.</p>
            </div>
          </article>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
