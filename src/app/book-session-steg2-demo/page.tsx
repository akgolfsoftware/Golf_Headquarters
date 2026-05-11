/**
 * PILOT — BookSessionModal · Steg 2 (Velg tid)
 * Bygd direkte fra wireframe/modal-C/01-book-session-steg2.html
 * URL: /book-session-steg2-demo
 *
 * Mock: Markus booker Mulligan Studio 1 — uke 20 (11.-17. mai 2026).
 */

import { X, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type SlotState = "free" | "booked" | "past" | "coach" | "selected";

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const GRID: SlotState[][] = [
  // 09
  ["past", "free", "booked", "free", "free", "free", "booked"],
  // 10
  ["past", "free", "coach", "booked", "free", "booked", "booked"],
  // 11
  ["past", "booked", "coach", "free", "free", "booked", "free"],
  // 12
  ["past", "free", "free", "free", "free", "free", "free"],
  // 13
  ["past", "booked", "free", "free", "booked", "booked", "free"],
  // 14
  ["free", "coach", "free", "free", "free", "booked", "free"],
  // 15
  ["free", "coach", "booked", "free", "free", "free", "free"],
  // 16
  ["free", "free", "free", "selected", "free", "booked", "free"],
  // 17
  ["booked", "booked", "free", "selected", "booked", "free", "booked"],
  // 18
  ["booked", "free", "booked", "free", "booked", "free", "free"],
  // 19
  ["free", "free", "free", "booked", "booked", "free", "free"],
  // 20
  ["free", "booked", "booked", "free", "free", "free", "booked"],
];

const DAYS = [
  { dow: "Man", date: "11", today: true },
  { dow: "Tir", date: "12" },
  { dow: "Ons", date: "13" },
  { dow: "Tor", date: "14" },
  { dow: "Fre", date: "15" },
  { dow: "Lør", date: "16" },
  { dow: "Søn", date: "17" },
];

export default function BookSessionSteg2Demo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span>Steg 2 av 3</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>Velg tid</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Book økt
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <StepDots active={1} total={3} />
            <button
              type="button"
              aria-label="Lukk"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Facility strip */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-lg bg-gradient-to-br from-secondary to-border text-muted-foreground">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <rect x="4" y="6" width="24" height="18" rx="2" />
                <path d="M4 11h24" />
                <circle cx="16" cy="17" r="2.5" />
              </svg>
            </div>
            <div>
              <div className="font-display text-[14px] font-semibold text-foreground">
                Mulligan Studio 1
              </div>
              <div className="font-mono text-[11.5px] text-muted-foreground">
                TrackMan 4 · 1 600 kr/t · 1,2 km
              </div>
            </div>
            <button
              type="button"
              className="ml-auto border-b border-current text-[12px] font-semibold text-primary"
            >
              Endre
            </button>
          </div>

          {/* Week nav */}
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Uke 20 · 11. – 17. mai 2026
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Forrige uke"
                className="grid h-[30px] w-[30px] place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="font-mono text-[12px] font-semibold text-foreground">
                Uke 20
              </span>
              <button
                type="button"
                aria-label="Neste uke"
                className="grid h-[30px] w-[30px] place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[42px_repeat(7,1fr)]">
              {/* Header row */}
              <div className="border-b border-r border-border bg-secondary/60 px-1 py-2" />
              {DAYS.map((d, i) => (
                <div
                  key={d.date}
                  className={`border-b border-border px-1 py-2 text-center ${
                    i < DAYS.length - 1 ? "border-r border-border/40" : ""
                  } bg-background`}
                >
                  <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {d.dow}
                  </div>
                  <div
                    className={`font-display text-[13px] font-semibold ${
                      d.today ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}

              {/* Rows */}
              {GRID.map((row, rowIdx) => (
                <Row key={HOURS[rowIdx]} hour={HOURS[rowIdx]} cells={row} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3.5 font-mono text-[10.5px] text-muted-foreground">
            <LegendItem swatch="border border-border bg-card" label="Ledig" />
            <LegendItem swatch="bg-[rgba(0,88,64,0.10)]" label="Coach (Anders) tilgj." />
            <LegendItem
              swatch="bg-[repeating-linear-gradient(45deg,var(--secondary),var(--secondary)_3px,var(--border)_3px,var(--border)_6px)]"
              label="Booket"
            />
            <LegendItem swatch="bg-accent ring-[1.5px] ring-inset ring-primary" label="Ditt valg" />
          </div>

          {/* Selected bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3.5">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                Valgt
              </div>
              <div className="mt-0.5 font-display text-[15px] font-semibold text-primary">
                Torsdag 14. mai · 16:30 – 17:30
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[18px] font-semibold text-foreground tabular-nums">
                1 600 kr
              </div>
              <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                60 min · Mulligan Studio 1
              </div>
            </div>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Tilbake
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Neste
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function StepDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < active ? "bg-primary/60" : i === active ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function Row({ hour, cells }: { hour: number; cells: SlotState[] }) {
  return (
    <>
      <div className="flex items-center justify-end border-b border-r border-border bg-secondary/60 px-1 py-1 text-right font-mono text-[10px] text-muted-foreground">
        {String(hour).padStart(2, "0")}
      </div>
      {cells.map((state, i) => (
        <Slot key={`${hour}-${i}`} state={state} last={i === cells.length - 1} />
      ))}
    </>
  );
}

function Slot({ state, last }: { state: SlotState; last: boolean }) {
  const base = `relative h-[26px] border-b border-border/40 ${
    last ? "" : "border-r border-border/40"
  }`;

  if (state === "free") {
    return <div className={`${base} cursor-pointer bg-card hover:bg-accent/20`} />;
  }
  if (state === "booked") {
    return (
      <div
        className={`${base} cursor-not-allowed`}
        style={{
          background:
            "repeating-linear-gradient(45deg, var(--secondary), var(--secondary) 3px, var(--border) 3px, var(--border) 6px)",
        }}
      />
    );
  }
  if (state === "past") {
    return <div className={`${base} cursor-not-allowed bg-secondary/50 opacity-50`} />;
  }
  if (state === "coach") {
    return (
      <div className={`${base} cursor-pointer bg-[rgba(0,88,64,0.10)] hover:bg-[rgba(0,88,64,0.16)]`}>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-primary">
          A
        </span>
      </div>
    );
  }
  return (
    <div className={`${base} cursor-pointer bg-accent`}>
      <span className="absolute inset-[2px] rounded-[3px] ring-2 ring-inset ring-primary" />
    </div>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-[3px] ${swatch}`} />
      {label}
    </span>
  );
}
