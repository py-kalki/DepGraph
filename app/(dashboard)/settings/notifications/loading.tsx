export default function NotificationsLoading() {
  return (
    <div className="dashboard-shell-content">
      <div className="settings-page-header">
        <div className="skeleton skeleton--title" aria-hidden="true" />
        <div className="skeleton skeleton--text" aria-hidden="true" />
      </div>
      <div className="settings-section">
        <div className="skeleton skeleton--card" aria-hidden="true" style={{ height: '240px' }} />
      </div>
      <p className="sr-only" role="status">Loading notification settings…</p>
    </div>
  );
}
