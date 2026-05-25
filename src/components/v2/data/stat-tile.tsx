"use client";

import { useCountUp } from "@/components/v2/hooks";
import type { StatTile as StatTileData } from "@/lib/v2-fixtures";

export type StatTileProps = {
  tile: StatTileData;
  idx?: number;
  /** Larger hero variant with more padding */
  hero?: boolean;
};

export default function StatTile({ tile, idx = 0, hero = false }: StatTileProps) {
  const [val, ref] = useCountUp<HTMLDivElement>(tile.value, {
    duration: 900,
    delay: 80 + idx * 60,
    decimals: tile.decimals ?? 0,
  });

  const toneColor =
    tile.tone === "accent"
      ? "var(--accent-fg)"
      : tile.tone === "warning"
        ? "var(--warning)"
        : tile.tone === "critical"
          ? "var(--destructive)"
          : "var(--muted-fg)";

  const toneBg =
    tile.tone === "accent"
      ? "color-mix(in oklab, var(--accent) 35%, transparent)"
      : "transparent";

  return (
    <div
      ref={ref}
      className="flex flex-col border border-border"
      style={{
        gap: hero ? 4 : 2,
        padding: hero ? 18 : 14,
        borderRadius: 14,
        background: "color-mix(in oklab, var(--foreground) 3%, transparent)",
      }}
    >
      <span className="eyebrow">{tile.label}</span>
      <div className="flex items-baseline gap-[5px] mt-[2px]">
        <span
          className="font-display tabular font-bold leading-none tracking-[-0.02em]"
          style={{ fontSize: 30 }}
        >
          {val}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {tile.unit}
        </span>
      </div>
      <div
        className="inline-flex self-start mt-1 font-mono text-[10px] font-semibold tracking-[0.04em] rounded-full"
        style={{
          padding: tile.tone === "accent" ? "2px 8px" : "0",
          background: toneBg,
          color: toneColor,
        }}
      >
        {tile.context}
      </div>
    </div>
  );
}
