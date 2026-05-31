// =============================================================================
// DepGraph — Dashboard Loading State
// Next.js streaming loading.tsx — shown while dashboard page data fetches.
// =============================================================================

import { GaugeSkeleton, LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <LoadingSkeleton width="200px" height="1.25rem" />
        <div style={{ marginTop: '0.5rem' }}>
          <LoadingSkeleton width="320px" height="0.875rem" />
        </div>
      </div>
      <div className="dashboard-grid-top">
        <div className="card" style={{ padding: 0 }}><GaugeSkeleton /></div>
        <div className="card"><LoadingSkeleton width="100%" height="5rem" /></div>
        <div className="card"><LoadingSkeleton width="100%" height="5rem" /></div>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <LoadingSkeleton width="100%" height="12rem" />
      </div>
    </>
  );
}
