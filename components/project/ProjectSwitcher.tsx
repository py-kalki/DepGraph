'use client';
// =============================================================================
// DepGraph — ProjectSwitcher
// Dropdown listing the user's saved projects. Navigates on selection.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DbProject } from '@/lib/types';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function ProjectSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<DbProject[]>([]);
  const [selected, setSelected] = useState<DbProject | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchProjects = () => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data: { projects?: DbProject[] }) => {
        const list = data.projects ?? [];
        setProjects(list);
        // Select the project matching ?project= param, else first
        const active = list.find(p => p.id === activeProjectId) ?? list[0] ?? null;
        setSelected(active);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchProjects(); }, [activeProjectId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (p: DbProject) => {
    setSelected(p);
    setOpen(false);
    router.push(`/dashboard?project=${p.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, p: DbProject) => {
    e.stopPropagation();
    if (!confirm(`Delete project "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      await fetch(`/api/projects/${p.id}`, { method: 'DELETE' });
      const remaining = projects.filter(x => x.id !== p.id);
      setProjects(remaining);
      setDeletingId(null);
      setOpen(false);
      if (selected?.id === p.id) {
        const next = remaining[0] ?? null;
        setSelected(next);
        router.push(next ? `/dashboard?project=${next.id}` : '/new');
      }
    } catch {
      setDeletingId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
        <div style={{ color: '#666666', cursor: 'default', padding: '0.5rem 1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>
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
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selected?.id === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
            >
              <button
                role="option"
                aria-selected={selected?.id === p.id}
                onClick={() => handleSelect(p)}
                type="button"
                style={{
                  flex: 1,
                  textAlign: 'left',
                  padding: '0.625rem 1rem',
                  background: 'transparent',
                  color: selected?.id === p.id ? '#FFFFFF' : '#888888',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.8125rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#FFFFFF' }}
                onMouseOut={(e) => { e.currentTarget.style.color = selected?.id === p.id ? '#FFFFFF' : '#888888' }}
              >
                {p.name}
              </button>
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, p)}
                disabled={deletingId === p.id}
                type="button"
                title={`Delete ${p.name}`}
                style={{
                  padding: '0.625rem 0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#444444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: deletingId === p.id ? 0.4 : 1,
                  transition: 'color 0.15s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#E24B4A' }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#444444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <a
            href="/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
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
