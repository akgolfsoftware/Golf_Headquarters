/**
 * DEMO — Drill Challenge Steg 1 (Lag ny challenge)
 * Bygd fra wireframe live-states/e1-drill-challenge-steg1-lag-ny.html
 * URL: /drill-challenge-steg1-lag-ny-demo
 */

import { ArrowRight, ChevronDown, Target, X } from "lucide-react";

const DURATIONS = [
  { label: "1 uke", active: true },
  { label: "2 uker", active: false },
  { label: "4 uker", active: false },
  { label: "Engangs", active: false },
];

const SCORING = [
  { label: "Beste forsøk", active: true },
  { label: "Snitt av 3", active: false },
  { label: "Antall fullførte", active: false },
];

export default function DrillChallengeSteg1LagNyDemo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div className="flex-1">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              Drill-<em className="italic">challenge</em>
            </h1>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Steg 1 av 2 · Lag ny eller bli med
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-primary" />
              <span className="h-1.5 w-8 rounded-full bg-border" />
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-secondary p-1">
            <button className="rounded-lg bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
              Lag ny challenge
            </button>
            <button className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Bli med på eksisterende
            </button>
          </div>

          {/* Velg drill */}
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Velg drill
          </label>
          <button className="mt-2 mb-6 flex w-full cursor-pointer items-center justify-between rounded-md border border-input bg-card px-4 py-3 text-left transition-colors hover:bg-secondary">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
                <Target size={18} strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold">10 putts fra 3 m</span>
                <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                  TEK · greenside · 10 forsøk
                </span>
              </span>
            </span>
            <ChevronDown size={18} strokeWidth={1.5} className="text-muted-foreground" />
          </button>

          {/* Varighet */}
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Varighet
          </label>
          <div className="mt-2 mb-6 flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  d.active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Scoring */}
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Scoring
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCORING.map((s) => (
              <button
                key={s.label}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  s.active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Neste
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
