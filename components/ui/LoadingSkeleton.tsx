// =============================================================================
// DepGraph — LoadingSkeleton
// Animated pulse placeholder for async content.
// =============================================================================

import type { CSSProperties } from 'react';

interface Props {
  width?: string;
  height?: string;
  className?: string;
  borderRadius?: string;
}

export function LoadingSkeleton({ width = '100%', height = '1rem', className, borderRadius }: Props) {
  const style: CSSProperties = { width, height };
  if (borderRadius) style.borderRadius = borderRadius;

  return (
    <div
      className={`skeleton ${className ?? ''}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
}

/** Pre-built skeleton for the gauge card */
export function GaugeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem' }}>
      <LoadingSkeleton width="120px" height="120px" borderRadius="50%" />
      <LoadingSkeleton width="60px" height="2.5rem" />
      <LoadingSkeleton width="80px" height="1rem" />
    </div>
  );
}

/** Pre-built skeleton for a table row */
export function TableRowSkeleton() {
  return (
    <tr>
      {[180, 80, 70, 90, 60, 100].map((w, i) => (
        <td key={i} style={{ padding: '0.75rem 1rem' }}>
          <LoadingSkeleton width={`${w}px`} height="0.875rem" />
        </td>
      ))}
    </tr>
  );
}
