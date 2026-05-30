"use client";

import { useCountUp } from "@/components/athletic/hooks";
import type { PyramidRow } from "@/lib/v2-fixtures";

export type PyramidBarProps = {
  row: PyramidRow;
  inView: boolean;
  delayIdx?: number;
};

export default function PyramidBar({
  row,
  inView,
  delayIdx = 0,
}: PyramidBarProps) {
  const [pctVal, pctRef] = useCountUp<HTMLDivElement>(row.pct, {
    duration: 1100,
    delay: delayIdx * 90,
  });

  const statusLabel =
    row.status === "OVER" ? "OVER" : row.status === "UNDER" ? "UNDER" : "OK";

  const statusBg =
    row.status === "OVER"
      ? "color-mix(in oklab, var(--warning) 16%, transparent)"
      : row.status === "UNDER"
        ? "color-mix(in oklab, var(--destructive) 14%, transparent)"
        : "color-mix(in oklab, var(--success) 16%, transparent)";

  const statusColor =
    row.status === "OVER"
      ? "var(--warning)"
      : row.status === "UNDER"
        ? "var(--destructive)"
        : "var(--success)";

  return (
    <div ref={pctRef} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="inline-flex items-baseline gap-[10px]">
          <span className="font-mono text-[11px] font-bold tracking-[0.10em] text-muted-foreground">
            {row.axis}
          </span>
          <span
            className="font-display tabular font-bold leading-none tracking-[-0.02em]"
            style={{ fontSize: 24 }}
          >
            {pctVal}
            <span className="text-[13px] text-muted-foreground ml-[2px]">
              %
            </span>
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            mål {row.mål}%
          </span>
        </span>
        <span
          className="inline-flex items-center font-mono text-[9px] font-bold uppercase tracking-[0.10em] rounded-full"
          style={{
            padding: "2px 8px",
            background: statusBg,
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Track */}
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          height: 8,
          background: "color-mix(in oklab, var(--foreground) 6%, transparent)",
        }}
      >
        {/* Fill */}
        <div
          className="pyr-bar-fill absolute inset-y-0 left-0 rounded-full"
          style={{
            background: row.color,
            width: inView ? `${row.pct}%` : "0%",
            transition: `width 1200ms cubic-bezier(0.22, 1, 0.36, 1) ${delayIdx * 80}ms`,
          }}
        />
        {/* Goal marker */}
        <div
          className="absolute -top-[2px] -bottom-[2px]"
          style={{
            left: `${row.mål}%`,
            width: 2,
            background: "color-mix(in oklab, var(--foreground) 45%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
