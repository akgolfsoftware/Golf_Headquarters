"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";

type Minutter = Record<PyramidArea, number>;
type Periode = "7d" | "30d" | "90d";

const PYR_REKKEFOLGE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const PYR_LABEL_KORT: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPL",
  TURN: "TUR",
};

const PYR_NAVN: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slagtyper",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys)",
  TEK: "var(--color-pyr-tek)",
  SLAG: "var(--color-pyr-slag)",
  SPILL: "var(--color-pyr-spill)",
  TURN: "var(--color-pyr-turn)",
};

const PERIODE_LABEL: Record<Periode, string> = {
  "7d": "Siste 7 dager",
  "30d": "Siste 30 dager",
  "90d": "Siste 90 dager",
};

function formatTimer(minutter: number): string {
  if (minutter === 0) return "0 t";
  const t = Math.floor(minutter / 60);
  const m = minutter % 60;
  if (t === 0) return `${m} m`;
  if (m === 0) return `${t} t`;
  return `${t} t ${m} m`;
}

function sumMinutter(m: Minutter): number {
  return Object.values(m).reduce((a, b) => a + b, 0);
}

export function PyramideTimerStatus({
  minutter7d,
  minutter30d,
  minutter90d,
  isFree,
}: {
  minutter7d: Minutter;
  minutter30d: Minutter;
  minutter90d: Minutter;
  isFree: boolean;
}) {
  const [periode, setPeriode] = useState<Periode>("30d");
  const aktivMinutter = { "7d": minutter7d, "30d": minutter30d, "90d": minutter90d }[periode];
  const totalt = sumMinutter(aktivMinutter);
  const maks = Math.max(1, ...Object.values(aktivMinutter));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm md:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Pyramide-status
          <span className="ml-2 font-sans text-sm font-normal italic text-muted-foreground">
            totalt {formatTimer(totalt)} · {PERIODE_LABEL[periode].toLowerCase()}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          {/* Periode-toggle */}
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            {(["7d", "30d", "90d"] as Periode[]).map((p) => {
              const aktiv = p === periode;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriode(p)}
                  className={`rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
                    aktiv
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "7d" ? "7 dgr" : p === "30d" ? "30 dgr" : "90 dgr"}
                </button>
              );
            })}
          </div>
          <Link
            href="/portal/tren"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            Forklaring
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div
        className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 ${
          isFree ? "blur-[3px] opacity-50" : ""
        }`}
      >
        {PYR_REKKEFOLGE.map((area) => {
          const minutter = aktivMinutter[area];
          const fyll = Math.min(100, (minutter / maks) * 100);
          return (
            <div
              key={area}
              className="flex flex-col items-center gap-2 rounded-md p-4 transition-colors hover:bg-secondary/40"
            >
              {/* Ring med fyllingsgrad relativt til største område */}
              <span className="relative h-24 w-24">
                <svg
                  viewBox="0 0 36 36"
                  className="h-full w-full -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={PYR_COLOR[area]}
                    strokeWidth="3.5"
                    strokeDasharray={`${(fyll / 100) * (2 * Math.PI * 14)} ${2 * Math.PI * 14}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 grid place-items-center">
                  <span className="flex flex-col items-center">
                    <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                      {formatTimer(minutter)}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      {PYR_LABEL_KORT[area]}
                    </span>
                  </span>
                </span>
              </span>
              <span className="font-display text-sm font-semibold text-foreground">
                {PYR_NAVN[area]}
              </span>
            </div>
          );
        })}
      </div>

      {isFree && (
        <Link
          href="/portal/meg/abonnement"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card/90 backdrop-blur-sm transition-colors hover:bg-card/95"
        >
          <span className="grid h-10 w-10 place-items-center rounded-md bg-foreground text-accent">
            <Lock className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="font-display text-sm font-semibold italic text-foreground">
            Pyramide kun for Pro
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground">
            Oppgrader →
          </span>
        </Link>
      )}
    </section>
  );
}
