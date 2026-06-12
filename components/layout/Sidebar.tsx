// =============================================================================
// DepGraph — Sidebar (Client Component)
// Left navigation — project switcher + nav links.
// Accepts `open` prop for mobile toggle via DashboardShell.
// =============================================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProjectSwitcher } from '@/components/project/ProjectSwitcher';
import { LayoutGrid, Settings, HelpCircle, CreditCard, Key, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard',       label: 'Dashboard', icon: LayoutGrid },
  { href: '/settings',        label: 'Settings',  icon: Settings   },
  { href: '/settings/billing',label: 'Billing',   icon: CreditCard },
  { href: '/settings/api',    label: 'API Keys',  icon: Key        },
  { href: '/support',         label: 'Support',   icon: HelpCircle },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={`sidebar${open ? ' open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo + close button row */}
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'baseline' }}>
          <span>dep</span><span>Graph</span>
        </span>
        {/* Close button — visible only on mobile via CSS */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-nav">
        <ProjectSwitcher />

        <span className="sidebar-section-label">Navigation</span>

        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${pathname === href ? ' active' : ''}`}
            id={`nav-${label.toLowerCase().replace(' ', '-')}`}
            onClick={onClose}   // close on mobile when navigating
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Keep the old name as an alias for any remaining server-side imports
export { MobileSidebar as Sidebar };
