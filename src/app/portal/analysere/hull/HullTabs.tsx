"use client";

// Klient-toggle for /portal/analysere/hull med to faner:
//   1. «Sone-kart»  — eksisterende SG-sone-kart (HoleAnalysis), uendret.
//   2. «Hull for hull» — score-tabell fra spillerens siste runde (ekte HoleScore-data).
// All data lastes i page.tsx (server) og sendes hit som props — komponenten fabrikkerer
// ingenting.

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoleAnalysis, type HoleZone } from "@/components/hole-analysis/hole-analysis";

export type HoleRow = {
  holeNumber: number;
  par: number;
  strokes: number;
  /** score − par, f.eks. -1 (birdie), 0 (par), +2 (dobbelbogey). */
  diff: number;
};

export type LastRound = {
  courseName: string;
  totalScore: number;
  parDiff: number; // sum av diff over alle hull
  holeCount: number;
  holes: HoleRow[];
};

type TabKey = "sone" | "hull";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sone", label: "Sone-kart" },
  { key: "hull", label: "Hull for hull" },
];

// «under par grønn, over par rød/varm, par nøytral» — samme konvensjon som
// runde-kortet i HybridAnalysePage.
function diffColor(diff: number): string {
  if (diff < 0) return "hsl(var(--success))";
  if (diff > 0) return "hsl(var(--destructive))";
  return "hsl(var(--muted-foreground))";
}

function diffLabel(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : String(diff);
}

function fmtSignedNb(n: number): string {
  return (n >= 0 ? "+" : "") + n.toLocaleString("nb-NO");
}

export function HullTabs({
  zones,
  sgRegistreringer,
  lastRound,
}: {
  zones: HoleZone[];
  sgRegistreringer: number;
  lastRound: LastRound | null;
}) {
  const [tab, setTab] = useState<TabKey>("sone");

  return (
    <>
      {/* Fane-bytter — appens etablerte pill-idiom */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex flex-shrink-0 items-center rounded-full border px-3.5 py-2 text-[12.5px] font-semibold text-foreground transition-colors",
                on
                  ? "border-accent bg-accent/16"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "sone" ? (
        <SoneKart zones={zones} sgRegistreringer={sgRegistreringer} />
      ) : (
        <HullForHull lastRound={lastRound} />
      )}
    </>
  );
}

// ── Fane 1: SG-sone-kart (uendret fra opprinnelig skjerm) ─────────────
function SoneKart({
  zones,
  sgRegistreringer,
}: {
  zones: HoleZone[];
  sgRegistreringer: number;
}) {
  const harData = sgRegistreringer > 0;
  return (
    <>
      <p className="text-[12.5px] text-muted-foreground">
        Trykk en sone for SG- og treningsdata.
      </p>

      <HoleAnalysis
        fairway={zones}
        putting={[]}
        green={null}
        holeLabel="Min SG-analyse"
        holeMeta={`${sgRegistreringer} registreringer`}
        caption="Kartet er illustrativt — tallene er dine faktiske SG- og treningsdata per sone. Trykk en sone."
      />

      {!harData && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <p className="text-sm leading-[1.5] text-muted-foreground">
            Ingen SG-registreringer ennå. Logg en runde med Strokes Gained, så fylles sonene
            med dine faktiske tall.
          </p>
        </div>
      )}
    </>
  );
}

// ── Fane 2: Hull for hull (ekte HoleScore fra siste runde) ────────────
function HullForHull({ lastRound }: { lastRound: LastRound | null }) {
  if (!lastRound) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <p className="text-sm leading-[1.5] text-muted-foreground">
          Ingen runder med registrert hull-score ennå. Logg en runde hull for hull, så ser
          du fordelingen her.
        </p>
      </div>
    );
  }

  const snittDiff = lastRound.parDiff / lastRound.holeCount;

  return (
    <div className="space-y-4">
      {/* Editorial header */}
      <div className="space-y-1.5">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Analyse · per hull
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground">
          Hull for hull{" "}
          <em className="font-medium italic text-primary">— {lastRound.courseName}</em>
        </h1>
      </div>

      {/* Stats-rad: total score / snitt mot par / antall hull */}
      <div className="grid grid-cols-3 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card">
        <div className="border-r border-border px-3 py-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            Score
          </div>
          <div className="mt-1 font-mono text-lg font-semibold text-foreground">
            {lastRound.totalScore}
          </div>
        </div>
        <div className="border-r border-border px-3 py-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            Snitt mot par
          </div>
          <div
            className="mt-1 font-mono text-lg font-semibold"
            style={{ color: diffColor(Math.round(snittDiff * 10)) }}
          >
            {(snittDiff >= 0 ? "+" : "") +
              snittDiff.toLocaleString("nb-NO", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            Hull
          </div>
          <div className="mt-1 font-mono text-lg font-semibold text-foreground">
            {lastRound.holeCount}
          </div>
        </div>
      </div>

      {/* Hull-tabell */}
      <div>
        <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Alle {lastRound.holeCount} hull
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-card px-3.5">
          {lastRound.holes.map((h, i) => (
            <div
              key={h.holeNumber}
              className={cn(
                "flex items-center gap-3 py-3",
                i > 0 && "border-t border-border/60",
              )}
            >
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary">
                <span className="font-mono text-[10px] font-bold text-foreground">
                  {h.holeNumber}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-mono text-[9.5px] text-muted-foreground">
                  Par {h.par}
                </div>
                <div className="font-mono text-[13px] font-semibold text-foreground">
                  {h.strokes}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-mono text-sm font-semibold"
                  style={{ color: diffColor(h.diff) }}
                >
                  {diffLabel(h.diff)}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground">
                  mot par
                </div>
              </div>
              <ChevronRight
                className="h-3 w-3 flex-none text-muted-foreground"
                strokeWidth={2}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10.5px] text-muted-foreground">
          Siste runde · {fmtSignedNb(lastRound.parDiff)} totalt mot par
        </p>
      </div>
    </div>
  );
}
