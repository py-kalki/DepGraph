'use client';
// =============================================================================
// DepGraph — ProjectSwitcher
// Dropdown listing the user's saved projects. Fetches from /api/projects.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import type { DbProject } from '@/lib/types';

export function ProjectSwitcher() {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [selected, setSelected] = useState<DbProject | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data: { projects?: DbProject[] }) => {
        const list = data.projects ?? [];
        setProjects(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => {/* silently ignore */});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (projects.length === 0) {
    return (
      <div className="project-switcher">
        <div className="project-switcher-btn" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
          No projects yet
        </div>
      </div>
    );
  }

  return (
    <div className="project-switcher" ref={ref}>
      <button
        id="project-switcher-btn"
        className="project-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="truncate">{selected?.name ?? 'Select project'}</span>
        <span aria-hidden="true" style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="project-switcher-dropdown" role="listbox">
          {projects.map((p) => (
            <button
              key={p.id}
              role="option"
              aria-selected={selected?.id === p.id}
              className={`project-switcher-item${selected?.id === p.id ? ' active' : ''}`}
              onClick={() => { setSelected(p); setOpen(false); }}
              type="button"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
