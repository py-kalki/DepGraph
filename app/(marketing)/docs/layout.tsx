'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';
import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path;

  return (
    <>
      <LandingNavbar />
      
      <main id="main-content" style={{ background: '#000000', minHeight: '100vh', paddingTop: '64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          {/* Sidebar */}
          <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.15)', padding: '3rem 1.5rem', flexShrink: 0 }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                Getting Started
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/docs" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs') ? 600 : 500, color: isCurrent('/docs') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>Overview</Link>
                <Link href="/docs/cli" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs/cli') ? 600 : 500, color: isCurrent('/docs/cli') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>CLI Guide</Link>
                <Link href="/docs/action" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs/action') ? 600 : 500, color: isCurrent('/docs/action') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>GitHub Action</Link>
              </nav>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                Core Platform
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/docs/api" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs/api') ? 600 : 500, color: isCurrent('/docs/api') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>API Reference</Link>
                <Link href="/docs/architecture" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs/architecture') ? 600 : 500, color: isCurrent('/docs/architecture') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>Architecture</Link>
                <Link href="/docs/billing" style={{ fontSize: '0.875rem', fontWeight: isCurrent('/docs/billing') ? 600 : 500, color: isCurrent('/docs/billing') ? '#FFFFFF' : '#888888', textDecoration: 'none' }}>Billing & Plans</Link>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <article style={{ flex: 1, padding: '4rem 4rem 8rem', maxWidth: '900px' }}>
            {children}
          </article>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
