'use client';
// =============================================================================
// DepGraph — ProjectSwitcher
// Dropdown listing the user's saved projects. Fetches from /api/projects.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import type { DbProject } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
      <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
        <div style={{ 
          color: '#666666', 
          cursor: 'default', 
          padding: '0.5rem 1rem', 
          fontFamily: 'JetBrains Mono, monospace', 
          fontSize: '0.8125rem' 
        }}>
          No projects yet
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }} ref={ref}>
      <button
        id="project-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1rem',
          background: open ? 'rgba(255,255,255,0.05)' : 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#FFFFFF',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        onMouseOut={(e) => { e.currentTarget.style.background = open ? 'rgba(255,255,255,0.05)' : 'transparent' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.name ?? 'Select project'}</span>
        {open ? <ChevronUp size={14} color="#888888" /> : <ChevronDown size={14} color="#888888" />}
      </button>

      {open && (
        <div 
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#000000',
            border: '1px solid rgba(255,255,255,0.15)',
            zIndex: 300,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {projects.map((p) => (
            <button
              key={p.id}
              role="option"
              aria-selected={selected?.id === p.id}
              onClick={() => { setSelected(p); setOpen(false); }}
              type="button"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.625rem 1rem',
                background: selected?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: selected?.id === p.id ? '#FFFFFF' : '#888888',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8125rem',
                border: 'none',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={(e) => { 
                e.currentTarget.style.color = selected?.id === p.id ? '#FFFFFF' : '#888888'; 
                e.currentTarget.style.background = selected?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent';
              }}
            >
              {p.name}
            </button>
          ))}
          <a
            href="/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              textAlign: 'left',
              padding: '0.625rem 1rem',
              background: 'transparent',
              color: '#FFFFFF',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            + New Project
          </a>
        </div>
      )}
    </div>
  );
}
