"use client";

/**
 * Reveal — fade + slide up on first intersection
 * Client component (requires IntersectionObserver + state).
 */

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Reveal({
  children,
  delay = 0,
  y = 12,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const TagName = Tag as React.ElementType;

  return (
    <TagName
      ref={ref}
      className={className || undefined}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .65s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .65s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </TagName>
  );
}
