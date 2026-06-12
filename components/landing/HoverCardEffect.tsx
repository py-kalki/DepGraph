'use client';

import { useEffect } from 'react';

/**
 * Tracks mouse position and sets --mouse-x on every .hover-card element.
 *
 * Performance fixes:
 *  - requestAnimationFrame throttle: only one DOM write per frame (16ms max)
 *  - Card list cached; only refreshed every 2s to pick up new mounts
 *  - getBoundingClientRect called only for cards visible in viewport
 *  - passive: true on the listener so the browser never has to wait for JS
 *    before scrolling (this was the root cause of the scroll-stuck bug)
 */
export default function HoverCardEffect() {
  useEffect(() => {
    let rafId: number | null = null;
    let cachedCards: HTMLElement[] = [];
    let lastCacheTime = 0;

    const refreshCache = () => {
      cachedCards = Array.from(document.querySelectorAll<HTMLElement>('.hover-card'));
      lastCacheTime = performance.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending frame
      if (rafId !== null) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        rafId = null;

        // Refresh card cache every 2 seconds (cheap)
        if (performance.now() - lastCacheTime > 2000) refreshCache();

        const cx = e.clientX;
        for (const card of cachedCards) {
          const rect = card.getBoundingClientRect();
          // Skip cards outside viewport — no need to update them
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          card.style.setProperty('--mouse-x', `${cx - rect.left}px`);
        }
      });
    };

    refreshCache();

    // passive: true is the critical fix — tells the browser this listener
    // will never call preventDefault(), so it can scroll immediately
    // without waiting for the JS handler to finish.
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
