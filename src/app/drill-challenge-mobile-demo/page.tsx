/**
 * DEMO — Drill Challenge (mobile, steg 1 av 2)
 * Bygd fra wireframe/_extracted/live-states/e1-drill-challenge-mobile.html
 * URL: /drill-challenge-mobile-demo
 */

import { ArrowRight, ChevronDown, Target, X } from "lucide-react";

type DurationOption = { key: string; label: string; active: boolean };
type ScoringOption = { key: string; label: string; active: boolean };

const DURATIONS: DurationOption[] = [
  { key: "1u", label: "1 uke", active: true },
  { key: "2u", label: "2 uker", active: false },
  { key: "4u", label: "4 uker", active: false },
  { key: "eng", label: "Engangs", active: false },
];

const SCORING: ScoringOption[] = [
  { key: "beste", label: "Beste forsøk", active: true },
  { key: "snitt", label: "Snitt av 3", active: false },
  { key: "fullf", label: "Antall fullførte", active: false },
];

export default function DrillChallengeMobileDemo() {
  return (
    <div className="min-h-screen w-full bg-foreground/80 flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-card flex flex-col">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 pt-5 pb-4">
          <div className="flex-1">
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-foreground">
              Drill-<em className="italic">challenge</em>
            </h1>
            <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Steg 1 av 2
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-primary" />
              <span className="h-1.5 w-8 rounded-full bg-border" />
            </div>
          </div>
          <button
            className="grid h-11 w-11 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 px-4 py-5 space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            <button className="rounded-lg bg-card px-2 py-2 font-sans text-[13px] font-medium text-foreground shadow-sm">
              Lag ny
            </button>
            <button className="rounded-lg bg-transparent px-2 py-2 font-sans text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Bli med
            </button>
          </div>

          {/* Velg drill */}
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Velg drill
            </label>
            <button className="mt-2 flex w-full items-center justify-between rounded-md border border-input bg-card px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                  <Target size={14} strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    10 putts fra 3 m
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    TEK · 10 forsøk
                  </div>
                </div>
              </div>
              <ChevronDown
                size={16}
                strokeWidth={1.75}
                className="text-muted-foreground"
              />
            </button>
          </div>

          {/* Varighet */}
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Varighet
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.key}
                  className={
                    d.active
                      ? "min-h-11 rounded-full border border-primary bg-primary px-4 py-2 font-sans text-[13px] font-medium text-primary-foreground"
                      : "min-h-11 rounded-full border border-border bg-card px-4 py-2 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  }
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scoring */}
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Scoring
            </label>
            <div className="mt-2 flex flex-col gap-2">
              {SCORING.map((s) => (
                <button
                  key={s.key}
                  className={
                    s.active
                      ? "flex h-11 items-center justify-start rounded-md border border-primary bg-primary px-4 font-sans text-[13px] font-medium text-primary-foreground"
                      : "flex h-11 items-center justify-start rounded-md border border-border bg-card px-4 font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-border bg-secondary/40 px-4 py-4">
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 font-sans text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Neste
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button className="inline-flex h-12 w-full items-center justify-center rounded-md font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt
          </button>
        </footer>
      </div>
    </div>
  );
}
