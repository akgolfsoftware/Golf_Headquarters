"use client";

/**
 * useInView — returnerer true når element kommer inn i viewport.
 *
 * Scroll-listener-basert (ikke IntersectionObserver) for å unngå
 * problemer i sandboxed iframes. Trigger ved 92% av viewport.
 * Respekterer prefers-reduced-motion (returnerer true umiddelbart).
 */

import { useEffect, useState, type RefObject } from "react";

function prefersReducedMotionSync(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useInView<T extends HTMLElement>(
  ref: RefObject<T | null>,
): boolean {
  // useState-initializer evalueres bare på mount — derfor sjekker vi
  // prefers-reduced-motion her og returnerer true direkte hvis aktiv.
  const [reducedMotion] = useState<boolean>(() => prefersReducedMotionSync());
  const [inViewState, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || reducedMotion) return;

    function check() {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        setInView(true);
      }
    }

    check();
    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check, { passive: true });

    return () => {
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
    };
  }, [ref, reducedMotion]);

  return reducedMotion || inViewState;
}
