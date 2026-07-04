"use client";

/**
 * PlayerHQ · Drill-galleri — hybrid design (2026-06-17).
 *
 * Port av «PlayerHQ Drills (hybrid).dc.html»:
 * - 2-kol grid med forest-gradient thumbnail + lime-gridmønster
 * - Filter-pills med lime-tinted aktiv state (Alle/FYS/TEK/SLAG/SPILL/TURN)
 * - Vanskelighetsgrad-badge per kort
 * - Klikk på kort → /portal/drills/[id]
 *
 * Props-drevet: tar DrillCard[] fra server-component (ekte Prisma-data).
 * Kategori-systemet følger databasen (FYS/TEK/SLAG/SPILL/TURN), ikke
 * design-mock (ARG/OTT/PUTT/FYS) — ekte data vinner over mockdata.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, Eyebrow } from "@/components/athletic/golfdata";

export type DrillAxis = "fys" | "tek" | "slag" | "spill" | "turn";
export type DrillDifficulty = "lett" | "middels" | "hard";

export type DrillCard = {
  id: string;
  axis: DrillAxis;
  axisLabel: string;
  title: string;
  /** Korte meta-fragmenter — første brukes som varighet-tekst i kortvisning. */
  meta: string[];
  difficulty: DrillDifficulty | null;
  fasilitet: string[];
  chsLink: boolean;
};

// ── Konstanter ──────────────────────────────────────────────────────────────

type AxisFilter = "alle" | DrillAxis;

const FILTER_ORDER: { key: AxisFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "fys", label: "FYS" },
  { key: "tek", label: "TEK" },
  { key: "slag", label: "SLAG" },
  { key: "spill", label: "SPILL" },
  { key: "turn", label: "TURN" },
];

const DIFFICULTY_LABEL: Record<DrillDifficulty, string> = {
  lett: "Lett",
  middels: "Middels",
  hard: "Hard",
};

// ok/warn/forest matcher design-tokenene
const DIFFICULTY_BG: Record<DrillDifficulty, string> = {
  lett: "rgba(26,125,86,.10)",
  middels: "rgba(184,133,42,.12)",
  hard: "rgba(0,88,64,.10)",
};

const DIFFICULTY_FG: Record<DrillDifficulty, string> = {
  lett: "var(--color-success)",
  middels: "var(--color-warning)",
  hard: "var(--color-primary)",
};

// ── Drill-kort ───────────────────────────────────────────────────────────────

function DrillCard({ drill }: { drill: DrillCard }) {
  const varighet = drill.meta[0] ?? null;

  return (
    <Link href={`/portal/drills/${drill.id}`} className="block">
      <Card interactive className="overflow-hidden" bodyStyle={{ padding: 0 }}>
      {/* Thumbnail — forest-gradient med lime-gridmønster */}
      <div
        className="relative h-[72px] w-full"
        style={{
          background: "linear-gradient(150deg,#2f5a2c,#0a2417)",
          borderRadius: "var(--radius-card) var(--radius-card) 0 0",
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(209,248,67,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(209,248,67,.3) 1px,transparent 1px)",
            backgroundSize: "18px 18px",
            borderRadius: "inherit",
          }}
        />
      </div>

      {/* Innhold */}
      <div className="px-3 py-2.5">
        <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {drill.axisLabel}
        </p>
        <h3 className="mt-1 text-[13px] font-bold leading-snug text-foreground">
          {drill.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {varighet ? (
            <span className="font-mono text-[10px] text-muted-foreground">
              {varighet}
            </span>
          ) : (
            <span />
          )}
          {drill.difficulty && (
            <span
              className="rounded-full font-mono text-[8.5px] font-bold uppercase"
              style={{
                padding: "2px 7px",
                background: DIFFICULTY_BG[drill.difficulty],
                color: DIFFICULTY_FG[drill.difficulty],
              }}
            >
              {DIFFICULTY_LABEL[drill.difficulty]}
            </span>
          )}
        </div>
      </div>
      </Card>
    </Link>
  );
}

// ── Hoved-komponent ──────────────────────────────────────────────────────────

export function DrillGallery({ drills }: { drills: DrillCard[] }) {
  const [activeFilter, setActiveFilter] = useState<AxisFilter>("alle");

  // Hvilke akser finnes faktisk — skjul tomme filter-knapper.
  const presentAxes = useMemo(() => {
    const s = new Set<DrillAxis>();
    for (const d of drills) s.add(d.axis);
    return s;
  }, [drills]);

  const filters = FILTER_ORDER.filter(
    (f) => f.key === "alle" || presentAxes.has(f.key as DrillAxis),
  );

  const visible = useMemo(
    () =>
      activeFilter === "alle"
        ? drills
        : drills.filter((d) => d.axis === activeFilter),
    [drills, activeFilter],
  );

  return (
    <div className="golfdata-scope px-0">
      {/* Side-header */}
      <div className="px-[18px] pb-4 pt-2">
        <Eyebrow className="mb-2.5 block" style={{ fontSize: "var(--text-11)", letterSpacing: "0.16em" }}>
          Drills
        </Eyebrow>
        <h1 className="font-display mb-3.5 text-[28px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          Velg <em className="font-medium italic text-primary">drill</em>
        </h1>

        {/* Filter-pills — horisontalt scrollbare */}
        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Filtrer drills etter kategori"
        >
          {filters.map((f) => {
            const on = f.key === activeFilter;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "flex-shrink-0 rounded-full border font-mono text-[11px] font-semibold transition-colors",
                  "px-[13px] py-[7px]",
                  on
                    ? "border-[var(--color-accent)] bg-[rgba(209,248,67,.16)] text-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drill-galleri (2-kol grid) */}
      {visible.length === 0 ? (
        <p className="px-[18px] py-12 text-center font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {drills.length === 0
            ? "Ingen drills i biblioteket ennå."
            : "Ingen drills i dette filteret."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 px-3.5">
          {visible.map((d) => (
            <DrillCard key={d.id} drill={d} />
          ))}
        </div>
      )}
    </div>
  );
}
