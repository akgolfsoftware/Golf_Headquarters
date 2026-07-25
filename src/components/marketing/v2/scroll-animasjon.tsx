"use client";

/**
 * Marketing scroll: reveal (IO) + subtil parallax (rAF).
 * Ved prefers-reduced-motion: ingen listeners — innhold synlig fra start.
 */

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Marker barn med .m-avslor som synlige når de kommer inn i viewport. */
export function useAvslor(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      root?.querySelectorAll(".m-avslor").forEach((el) => {
        el.classList.add("m-avslor-synlig");
      });
      return;
    }
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".m-avslor"));
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("m-avslor-synlig");
            io.unobserve(e.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootRef]);
}

/**
 * Parallax: forskyver element max `maxFrac` av scroll-delta (default 0.2).
 * Oppdateres via rAF — ikke på hvert scroll-event.
 */
export function useParallaks(
  elRef: RefObject<HTMLElement | null>,
  maxFrac = 0.2,
) {
  useEffect(() => {
    const el = elRef.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    let pending = false;
    const tick = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 midt i viewport, ±1 ved kant
      const p = (rect.top + rect.height / 2 - vh / 2) / vh;
      const y = Math.max(-40, Math.min(40, -p * maxFrac * 100));
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [elRef, maxFrac]);
}

/** Wrapper som aktiverer avslør for hele undertreet. */
export function AvslorRoot({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useAvslor(ref);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
