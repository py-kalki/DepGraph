'use client';

import React from 'react';

interface SkeletonProps {
  width?:     string | number;
  height?:    string | number;
  className?: string;
  rounded?:   boolean;
  circle?:    boolean;
  style?:     React.CSSProperties;
}

export function Skeleton({ width, height, className = '', rounded = false, circle = false }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width)  style.width  = typeof width  === 'number' ? `${width}px`  : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  if (circle) { style.borderRadius = '50%'; }

  const cls = [
    'skeleton',
    rounded ? 'skeleton--rounded' : '',
    circle  ? 'skeleton--circle'  : '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={cls} style={style} aria-hidden="true" />;
}

/** Pre-built skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton height={14} width="60%" className="skeleton--text" />
      <Skeleton height={32} width="40%" className="skeleton--title" />
    </div>
  );
}

/** Pre-built skeleton for a table row */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0.75rem 1rem' }}>
          <Skeleton height={14} width={i === 0 ? '70%' : '50%'} />
        </td>
      ))}
    </tr>
  );
}
