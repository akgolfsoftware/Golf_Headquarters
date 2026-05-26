"use client";

import type { PyramidArea } from "@/generated/prisma/client";

const PYR_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "FYS", TEK: "TEK", SLAG: "SLAG", SPILL: "SPILL", TURN: "TURN",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

type PyramideDrill = {
  pyramidArea: PyramidArea;
  durationMin?: number | null;
};

export function PyramideFordeling({
  drills,
  compact = false,
}: {
  drills: PyramideDrill[];
  compact?: boolean;
}) {
  const totalt = drills.reduce((sum, d) => sum + (d.durationMin ?? 1), 0);
  const perArea: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const d of drills) {
    perArea[d.pyramidArea] += d.durationMin ?? 1;
  }

  if (totalt === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Ingen driller valgt enna
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Pyramide-fordeling
        </div>
      )}

      {/* Stacked bar */}
      <div className="flex h-6 overflow-hidden rounded-full">
        {PYR_ORDER.map((area) => {
          const pct = (perArea[area] / totalt) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={area}
              className={`${PYR_BG[area]} flex items-center justify-center transition-all`}
              style={{ width: `${pct}%` }}
            >
              {pct >= 10 && (
                <span className="font-mono text-[9px] font-bold text-white">
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {PYR_ORDER.map((area) => {
          const pct = totalt > 0 ? Math.round((perArea[area] / totalt) * 100) : 0;
          if (perArea[area] === 0) return null;
          return (
            <div key={area} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${PYR_BG[area]}`} />
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {PYR_LABEL[area]} {pct}%
                {!compact && <span className="text-foreground"> ({perArea[area]} min)</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Antall og total */}
      {!compact && (
        <div className="flex gap-6 font-mono text-[11px] text-muted-foreground">
          <span>{drills.length} drill{drills.length === 1 ? "" : "s"}</span>
          <span>{totalt} min totalt</span>
        </div>
      )}
    </div>
  );
}
