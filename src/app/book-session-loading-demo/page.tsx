/**
 * DEMO — Book session steg 2 · loading
 * Bygd fra wireframe modaler-C/01-book-session-steg2-loading.html
 * URL: /book-session-loading-demo
 */

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2, Monitor, X } from "lucide-react";

const HOURS = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const DAYS = [
  { dow: "Man", date: "11" },
  { dow: "Tir", date: "12" },
  { dow: "Ons", date: "13" },
  { dow: "Tor", date: "14" },
  { dow: "Fre", date: "15" },
  { dow: "Lør", date: "16" },
  { dow: "Søn", date: "17" },
];

export default function BookSessionLoadingDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[720px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <span>Steg 2 av 3</span>
              <span className="text-muted-foreground/50">·</span>
              <span>Velg tid</span>
            </div>
            <h1 className="mt-1 font-display text-[24px] font-semibold leading-tight tracking-tight">
              Book <em className="italic">økt</em>
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <button
              className="ml-2 grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          {/* Facility strip */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-card text-muted-foreground">
              <Monitor size={18} strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold">Mulligan Studio 1</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                TrackMan 4 · 1 600 kr/t · 1,2 km
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-mono text-[11px] font-semibold text-primary">
              <Loader2 size={12} strokeWidth={2} className="animate-spin" />
              Henter ledige tider …
            </div>
          </div>

          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Uke 20 · 11. – 17. mai 2026
            </span>
            <div className="flex items-center gap-1.5">
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary">
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <button className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary">
                I dag
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary">
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-[42px_repeat(7,1fr)] overflow-hidden rounded-xl border border-border bg-card">
            {/* Header row */}
            <div className="border-b border-border bg-secondary/60" />
            {DAYS.map((d) => (
              <div
                key={d.date}
                className="flex flex-col items-center gap-0.5 border-b border-r border-border/40 bg-secondary/30 px-1 py-2 last:border-r-0"
              >
                <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {d.dow}
                </div>
                <div className="text-[13px] font-semibold">{d.date}</div>
              </div>
            ))}

            {/* Hour rows */}
            {HOURS.map((h) => (
              <div key={h} className="contents">
                <div className="flex items-center justify-end border-b border-r border-border/40 bg-secondary/40 pr-1.5 font-mono text-[10px] text-muted-foreground">
                  {h}
                </div>
                {DAYS.map((d) => (
                  <div
                    key={`${h}-${d.date}`}
                    className="relative h-7 border-b border-r border-border/40 last:border-r-0"
                  >
                    <span className="absolute inset-1 animate-pulse rounded-sm bg-secondary" />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend skeletons */}
          <div className="flex gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-2.5 w-[90px] animate-pulse rounded-sm bg-secondary"
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-4">
          <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <ArrowLeft size={14} strokeWidth={2} />
            Tilbake
          </button>
          <button
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground opacity-50"
            disabled
          >
            Neste
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
