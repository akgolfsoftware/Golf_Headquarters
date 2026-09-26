import React from "react";

export interface SwissMetricItem {
  id: string;
  /** Tittel/Etikett på metrikken (f.eks. "AVG SG", "SLAGLENGDE", "PULSSONE") */
  label: string;
  /** Verdi skrevet i tabulær IBM Plex Mono (f.eks. "+1.4", "248 m", "15'11\"") */
  value: string | number;
  /** Enhet eller sekundær metadata (f.eks. "vs forrige uke", "154 bpm", "1σ") */
  unitOrMeta?: string;
  /** Valgfri fargetone på verdi (f.eks. "success", "warning", "neutral") */
  trend?: "positive" | "negative" | "neutral";
  /** Valgfritt ikon eller kilde-tag (f.eks. "TrackMan", "SG Gap") */
  sourceTag?: string;
}

export interface SwissMetricGridProps {
  items: SwissMetricItem[];
  /** Sortering og rutenett-oppsett (standard er 2 kolonner på mobil, 4 på desktop) */
  columns?: 2 | 3 | 4;
  /** Tema/Overflate-modus */
  surface?: "light" | "dark";
  className?: string;
}

/**
 * SwissMetricGrid – Presisjonsrutenett for datapresentasjon
 * Bruker IBM Plex Mono for tall (tabular-nums) og IBM Plex Sans for etiketter i henhold til AK Golf Design System.
 */
export function SwissMetricGrid({
  items,
  columns = 4,
  surface = "light",
  className = "",
}: SwissMetricGridProps) {
  const isDark = surface === "dark";

  const gridColsClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={`grid ${gridColsClass} gap-3 sm:gap-4 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 sm:p-5 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
            isDark
              ? "bg-zinc-900 border-white/10 text-white"
              : "bg-white border-black/[0.08] text-zinc-950 shadow-xs"
          }`}
        >
          {/* Topprad: Etikett og Kilde-tag */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider font-sans ${
                isDark ? "text-white/60" : "text-black/60"
              }`}
            >
              {item.label}
            </span>
            {item.sourceTag && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs ${
                  isDark
                    ? "bg-white/10 text-white/70"
                    : "bg-black/[0.05] text-black/70"
                }`}
              >
                {item.sourceTag}
              </span>
            )}
          </div>

          {/* Hovedverdi i IBM Plex Mono */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-semibold font-mono tracking-tight tabular-nums ${
                item.trend === "positive"
                  ? "text-emerald-500"
                  : item.trend === "negative"
                  ? "text-rose-500"
                  : isDark
                  ? "text-white"
                  : "text-zinc-950"
              }`}
            >
              {item.value}
            </span>
          </div>

          {/* Sekundær metadata */}
          {item.unitOrMeta && (
            <p
              className={`text-xs font-sans mt-2 font-medium ${
                isDark ? "text-white/50" : "text-black/50"
              }`}
            >
              {item.unitOrMeta}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
