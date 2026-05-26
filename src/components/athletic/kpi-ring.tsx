"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type KpiRingProps = {
  /** 0–maks, klampes til området */
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
};

type Variant = "primary" | "warning" | "danger";

const variantStroke: Record<Variant, string> = {
  primary: "hsl(var(--primary))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--destructive))",
};

function variantFor(pct: number): Variant {
  if (pct < 30) return "danger";
  if (pct < 50) return "warning";
  return "primary";
}

export function KpiRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 2,
  label,
  className,
}: KpiRingProps) {
  const target = Math.max(0, Math.min(100, (value / max) * 100));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const stroke = variantStroke[variantFor(target)];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(target)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 250ms ease-out, stroke 200ms ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
          {Math.round(target)}%
        </span>
        {label && (
          <span className="mt-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
