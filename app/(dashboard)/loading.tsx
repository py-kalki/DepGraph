import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="dashboard-layout">
      {/* Header skeleton */}
      <div className="dashboard-header">
        <div className="skeleton skeleton--title" style={{ width: '220px', height: '28px' }} />
        <div className="skeleton" style={{ width: '100px', height: '34px', borderRadius: '8px' }} />
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Score + chart skeleton */}
      <div className="dashboard-content-grid">
        <div className="skeleton skeleton--card" style={{ height: '240px', flex: 1 }} />
        <div className="skeleton skeleton--card" style={{ height: '240px', flex: 2 }} />
      </div>

      {/* Table skeleton */}
      <div className="table-container">
        <table className="deps-table" style={{ width: '100%' }}>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
