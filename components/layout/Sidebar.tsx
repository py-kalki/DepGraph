// =============================================================================
// DepGraph — Sidebar (Server Component)
// Left navigation — project switcher + nav links.
// ProjectSwitcher is a Client Component embedded inside.
// =============================================================================

import Link from 'next/link';
import { ProjectSwitcher } from '@/components/project/ProjectSwitcher';
import { LayoutGrid, Settings, HelpCircle, CreditCard, Key } from 'lucide-react';

export function Sidebar() {
  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-logo">
        <span>dep</span>
        <span>Graph</span>
      </div>

      <div className="sidebar-nav">
        <ProjectSwitcher />

        <span className="sidebar-section-label">Navigation</span>

        <Link href="/dashboard" className="sidebar-link active" id="nav-dashboard">
          <LayoutGrid size={16} /> Dashboard
        </Link>
        <Link href="/settings" className="sidebar-link" id="nav-settings">
          <Settings size={16} /> Settings
        </Link>
        <Link href="/settings/billing" className="sidebar-link" id="nav-billing">
          <CreditCard size={16} /> Billing
        </Link>
        <Link href="/settings/api" className="sidebar-link" id="nav-api-keys">
          <Key size={16} /> API Keys
        </Link>
        <Link href="/support" className="sidebar-link" id="nav-support">
          <HelpCircle size={16} /> Support
        </Link>
      </div>
    </nav>
  );
}
