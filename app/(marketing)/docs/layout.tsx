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
      
      <main id="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="bg-radial-glow"></div>
        
        <div className="docs-layout">
          {/* Sidebar */}
          <aside className="docs-sidebar">
            <div className="docs-sidebar-group">
              <h4>Getting Started</h4>
              <nav className="docs-sidebar-links">
                <Link href="/docs" className={`docs-sidebar-link ${isCurrent('/docs') ? 'active' : ''}`}>Overview</Link>
                <Link href="/docs/cli" className={`docs-sidebar-link ${isCurrent('/docs/cli') ? 'active' : ''}`}>CLI Guide</Link>
                <Link href="/docs/action" className={`docs-sidebar-link ${isCurrent('/docs/action') ? 'active' : ''}`}>GitHub Action</Link>
              </nav>
            </div>
            
            <div className="docs-sidebar-group">
              <h4>Core Platform</h4>
              <nav className="docs-sidebar-links">
                <Link href="/docs/api" className={`docs-sidebar-link ${isCurrent('/docs/api') ? 'active' : ''}`}>API Reference</Link>
                <Link href="/docs/architecture" className={`docs-sidebar-link ${isCurrent('/docs/architecture') ? 'active' : ''}`}>Architecture</Link>
                <Link href="/docs/billing" className={`docs-sidebar-link ${isCurrent('/docs/billing') ? 'active' : ''}`}>Billing & Plans</Link>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <article className="docs-content docs-prose glass-panel" style={{ padding: '3rem' }}>
            {children}
          </article>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
