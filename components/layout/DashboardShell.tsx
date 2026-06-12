// =============================================================================
// DepGraph — DashboardShell (Client Component)
// Manages mobile sidebar open/close state and wires it to Sidebar + Navbar.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { MobileNavbar } from '@/components/layout/Navbar';
import { MobileSidebar } from '@/components/layout/Sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change / resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 769) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="dashboard-shell">
      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />

      <main className="dashboard-main">
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
