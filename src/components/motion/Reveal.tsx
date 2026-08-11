'use client';

import { useEffect } from 'react';

/**
 * Scroll-reveal fallback — the only client component on the site.
 *
 * It exists solely for browsers without CSS scroll-driven animations
 * (`animation-timeline: view()`), which globals.css handles with no script at
 * all. Where that is supported, this mounts, checks, and does nothing.
 *
 * Two rules make it safe on a slow Ghanaian connection:
 *
 *   1. It NEVER hides anything the visitor can already see. On init it arms
 *      only elements below the fold, so there is no flash of content
 *      disappearing and no blank page if the script is late.
 *   2. It adds the hidden state itself. Without JavaScript the markup is
 *      plain and fully visible — the animation is the enhancement, not the
 *      baseline.
 */
export function Reveal() {
  useEffect(() => {
    // Path A already handles this — nothing to do.
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (targets.length === 0) return;

    const viewportHeight = window.innerHeight;
    const armed: HTMLElement[] = [];

    for (const el of targets) {
      // Below the fold only. Anything on screen stays exactly as rendered.
      if (el.getBoundingClientRect().top > viewportHeight * 0.9) {
        el.classList.add('reveal-armed');
        armed.push(el);
      }
    }

    if (armed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    for (const el of armed) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return null;
}
