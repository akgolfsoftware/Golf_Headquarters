"use client";

import { cn } from "@/lib/utils";

export type TickerItem = {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
};

export type TickerProps = {
  items: TickerItem[];
  className?: string;
};

export function Ticker({ items, className }: TickerProps) {
  if (items.length === 0) return null;

  // Duplicate items so the loop feels seamless
  const doubled = [...items, ...items];

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none !important; }
        }
      `}</style>
      <div
        className={cn(
          "h-8 w-full overflow-hidden flex items-center",
          className,
        )}
        style={{ backgroundColor: "var(--forest-deep)" }}
        role="marquee"
        aria-label="Live KPI-stripe"
      >
        {/* Live pulse dot */}
        <span
          className="ml-3 mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse"
          aria-hidden="true"
        />

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          <div
            className="ticker-track flex whitespace-nowrap"
            style={{ animation: "scroll-left 24s linear infinite" }}
          >
            {doubled.map((item, i) => (
              <TickerItemSpan key={i} item={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TickerItemSpan({ item }: { item: TickerItem }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4">
      {/* Label */}
      <span
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {item.label}
      </span>

      {/* Value */}
      <span className="font-mono text-xs font-bold text-accent tabular-nums">
        {item.value}
      </span>

      {/* Delta */}
      {item.delta !== undefined && (
        <span
          className={cn(
            "font-mono text-[10px] font-medium tabular-nums",
            item.positive === true
              ? "text-success"
              : item.positive === false
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {item.delta}
        </span>
      )}

      {/* Separator dot */}
      <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
        ·
      </span>
    </span>
  );
}
