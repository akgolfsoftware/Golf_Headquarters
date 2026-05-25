"use client";

/**
 * CountUp — count from 0 to value when element enters viewport
 * Client component (requires IntersectionObserver + requestAnimationFrame).
 */

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUp({
  value,
  duration = 700,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  style,
}: CountUpProps) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(value * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setN(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  const display =
    decimals > 0
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString("nb-NO");

  return (
    <span ref={ref} className={className || undefined} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
