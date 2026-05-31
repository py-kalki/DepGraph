// =============================================================================
// DepGraph — Sidebar (Server Component)
// Left navigation — project switcher + nav links.
// ProjectSwitcher is a Client Component embedded inside.
// =============================================================================

import Link from 'next/link';
import { ProjectSwitcher } from '@/components/project/ProjectSwitcher';

export function Sidebar() {
  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-logo">
        Dep<span>Graph</span>
      </div>

      <div className="sidebar-nav">
        <ProjectSwitcher />

        <span className="sidebar-section-label">Navigation</span>

        <Link href="/dashboard" className="sidebar-link" id="nav-dashboard">
          <span aria-hidden="true">▦</span> Dashboard
        </Link>
      </div>
    </nav>
  );
}
