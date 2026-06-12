'use client';

import { useEffect, useRef } from 'react';

const LINES = [
  { delay: 0,    text: '$ npx depgraph-scanner check', type: 'cmd' },
  { delay: 600,  text: 'DepGraph v1.0 — Scanning 247 dependencies...', type: 'info' },
  { delay: 1400, text: '', type: 'blank' },
  { delay: 1600, text: '  Project Health Score: 71 / 100  ▓▓▓▓▓▓▓░░░', type: 'score' },
  { delay: 2000, text: '', type: 'blank' },
  { delay: 2200, text: '  CRITICAL (2)', type: 'critical' },
  { delay: 2400, text: '  ──────────────────────────────────────────', type: 'dim' },
  { delay: 2600, text: '  ✗  event-stream    Score: 12   Last commit: 3yr ago', type: 'critical' },
  { delay: 2900, text: '     ↳ Hijacking history. Migrate to mitt.', type: 'dim' },
  { delay: 3200, text: '  ✗  node-forge      Score: 24   3 open critical CVEs', type: 'critical' },
  { delay: 3500, text: '     ↳ Migrate to node:crypto built-in.', type: 'dim' },
  { delay: 3800, text: '', type: 'blank' },
  { delay: 4000, text: '  HIGH (7)   MEDIUM (18)   LOW (41)   HEALTHY (179)', type: 'summary' },
  { delay: 4400, text: '', type: 'blank' },
  { delay: 4600, text: '  Full report: https://depgraph.vedanshh.dev/r/a3f9x2k1', type: 'link' },
];

const TYPE_COLORS: Record<string, string> = {
  cmd:      '#1D9E75',
  info:     '#CBD5E1',
  score:    '#378ADD',
  critical: '#E24B4A',
  dim:      '#475569',
  summary:  '#94A3B8',
  link:     '#378ADD',
  blank:    'transparent',
};

export default function TerminalDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    linesRef.current.forEach((el) => {
      if (el) el.style.opacity = '0';
    });

    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        const el = linesRef.current[i];
        if (el) {
          el.style.opacity = '1';
          el.style.transition = 'opacity 0.2s ease';
        }
      }, line.delay),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      ref={containerRef}
      className="terminal-demo"
      role="img"
      aria-label="Terminal showing npx depgraph-scanner check output"
    >
      <div className="terminal-header">
        <span className="terminal-dot" style={{ background: '#E24B4A' }} />
        <span className="terminal-dot" style={{ background: '#EF9F27' }} />
        <span className="terminal-dot" style={{ background: '#1D9E75' }} />
        <span className="terminal-title">zsh — 80×24</span>
      </div>
      <div className="terminal-body">
        {LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => { if (el) linesRef.current[i] = el; }}
            style={{ color: TYPE_COLORS[line.type] ?? '#CBD5E1', opacity: 0 }}
          >
            {line.text || '\u00A0'}
          </div>
        ))}
        <span className="terminal-cursor">▋</span>
      </div>
    </div>
  );
}
