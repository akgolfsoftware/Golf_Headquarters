"use client";

/**
 * useCountUp — count number from 0 to target when element scrolls into view.
 *
 * Scroll/resize listener-basert (ikke IntersectionObserver) for å unngå
 * problemer i sandboxed iframes. Trigger ved 95% av viewport.
 * Respekterer prefers-reduced-motion (returnerer target umiddelbart).
 *
 * @example
 * const [display, ref] = useCountUp(47, { duration: 800 });
 * return <span ref={ref}>{display}</span>;
 */

import { useEffect, useMemo, useRef, useState } from "react";

type UseCountUpOptions = {
  duration?: number;
  decimals?: number;
  delay?: number;
};

function prefersReducedMotionSync(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  opts: UseCountUpOptions = {},
): [string | number, React.RefObject<T | null>] {
  const { duration = 900, decimals = 0, delay = 0 } = opts;
  const ref = useRef<T | null>(null);
  // useState-initializer evalueres bare på mount — derfor sjekker vi
  // prefers-reduced-motion her, og resultatet sammen med target i useMemo nedenfor.
  const [reducedMotion] = useState<boolean>(() => prefersReducedMotionSync());
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!ref.current || reducedMotion) return;
    startedRef.current = false;

    let raf = 0;
    let t0 = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      setVal(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    }

    function check() {
      if (startedRef.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.95 && r.bottom > 0) {
        startedRef.current = true;
        if (delay > 0) {
          setTimeout(() => {
            raf = requestAnimationFrame(tick);
          }, delay);
        } else {
          raf = requestAnimationFrame(tick);
        }
      }
    }

    check();
    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
    };
  }, [target, duration, delay, reducedMotion]);

  // Hvis reduced-motion: returner target. Ellers den animerte val.
  const effective = reducedMotion ? target : val;
  const formatted = useMemo(() => {
    if (decimals === 0) return Math.round(effective);
    return effective.toFixed(decimals);
  }, [effective, decimals]);

  return [formatted, ref];
}
