"use client";

/**
 * useHeroParallax — skalerer hero-element 1.0 → maxScale ved scroll.
 *
 * Skriver CSS-variable `--hero-scale` + `--hero-translate` på elementet.
 * Bruk disse i CSS:
 *   transform: scale(var(--hero-scale, 1)) translateY(var(--hero-translate, 0));
 *
 * Respekterer prefers-reduced-motion.
 */

import { useEffect, type RefObject } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

type UseHeroParallaxOptions = {
  maxScale?: number;
};

export function useHeroParallax<T extends HTMLElement>(
  ref: RefObject<T | null>,
  opts: UseHeroParallaxOptions = {},
): void {
  const { maxScale = 1.06 } = opts;

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;

    const el = ref.current;
    let raf = 0;

    function update() {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 0 when hero top is at top of viewport, 1 when scrolled past
      const scrolled = Math.max(0, Math.min(1, -r.top / (vh * 0.6)));
      el.style.setProperty("--hero-scale", String(1 + scrolled * (maxScale - 1)));
      el.style.setProperty("--hero-translate", `${scrolled * -20}px`);
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, maxScale]);
}
