'use client';

import { useEffect, useState } from 'react';

type Metrics = {
  users: { free: number; pro: number; team: number; total: number };
  projects: { active: number };
  beta: { invited: number };
  mrr: number;
};

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Forbidden' : 'Failed to fetch metrics');
        return res.json();
      })
      .then(setMetrics)
      .catch(err => setError((err as Error).message));
  }, []);

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!metrics) return <div className="p-8">Loading metrics...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 border border-gray-800 rounded-lg">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{metrics.users.total}</p>
        </div>
        
        <div className="card p-6 border border-gray-800 rounded-lg">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">MRR</h3>
          <p className="text-4xl font-bold text-green-400">${metrics.mrr}</p>
        </div>

        <div className="card p-6 border border-gray-800 rounded-lg">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Projects</h3>
          <p className="text-4xl font-bold">{metrics.projects.active}</p>
        </div>

        <div className="card p-6 border border-gray-800 rounded-lg">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Beta Users</h3>
          <p className="text-4xl font-bold text-brand-primary">{metrics.beta.invited}</p>
        </div>
      </div>

      <div className="card p-6 border border-gray-800 rounded-lg max-w-md">
        <h3 className="text-xl font-semibold mb-4">Plan Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Team</span>
            <span className="font-semibold">{metrics.users.team}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Pro</span>
            <span className="font-semibold">{metrics.users.pro}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Free</span>
            <span className="font-semibold">{metrics.users.free}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
