export default function BillingLoading() {
  return (
    <div className="dashboard-shell-content">
      <div className="settings-page-header">
        <div className="skeleton skeleton--title" aria-hidden="true" />
        <div className="skeleton skeleton--text" aria-hidden="true" />
      </div>
      <div className="settings-section">
        <div className="skeleton skeleton--card" aria-hidden="true" style={{ height: '120px' }} />
      </div>
      <div className="settings-section">
        <div className="skeleton skeleton--table" aria-hidden="true" style={{ height: '200px' }} />
      </div>
      <p className="sr-only" role="status">Loading billing information…</p>
    </div>
  );
}
