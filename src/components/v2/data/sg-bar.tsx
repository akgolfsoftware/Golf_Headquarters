"use client";

import { useRef } from "react";
import { useInView, useCountUp } from "@/components/v2/hooks";

export type SgBarProps = {
  /** Category label e.g. "OTT", "APP" */
  label: string;
  /** SG value — can be negative */
  value: number;
  /** Symmetric range for bar width calculation (default 2) */
  max?: number;
  /** Stagger delay index */
  idx?: number;
};

export default function SgBar({
  label,
  value,
  max = 2,
  idx = 0,
}: SgBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const positive = value >= 0;
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  const [val, vRef] = useCountUp<HTMLSpanElement>(Math.abs(value), {
    duration: 1000,
    delay: 100 + idx * 80,
    decimals: 1,
  });

  return (
    <div ref={ref} className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] font-bold tracking-[0.10em] text-muted-foreground">
          SG-{label}
        </span>
        <span
          ref={vRef}
          className="font-display tabular font-bold tracking-[-0.02em]"
          style={{
            fontSize: 22,
            color: positive ? "var(--success)" : "var(--destructive)",
          }}
        >
          {positive ? "+" : "−"}
          {val}
        </span>
      </div>

      {/* Symmetric bar — negative left, positive right */}
      <div
        className="grid h-[10px]"
        style={{ gridTemplateColumns: "1fr 2px 1fr" }}
      >
        {/* Left (negative) side */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "color-mix(in oklab, var(--destructive) 8%, transparent)",
            borderRadius: "999px 0 0 999px",
          }}
        >
          {!positive && (
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{
                width: inView ? `${pct}%` : "0%",
                background: "var(--destructive)",
                transition: `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 80}ms`,
              }}
            />
          )}
        </div>

        {/* Center divider */}
        <div style={{ background: "var(--foreground)", opacity: 0.4 }} />

        {/* Right (positive) side */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "color-mix(in oklab, var(--success) 8%, transparent)",
            borderRadius: "0 999px 999px 0",
          }}
        >
          {positive && (
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: inView ? `${pct}%` : "0%",
                background: "var(--success)",
                transition: `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 80}ms`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
