/**
 * DEMO — BookSessionModal · Steg 2 · Velg tid · Dark
 * Bygd fra wireframe modal-C/01-book-session-steg2-dark.html
 * URL: /book-session-dark-demo
 */

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";

type SlotState = "free" | "booked" | "past" | "coach" | "selected";

const TIMES = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"] as const;
interface Day {
  dow: string;
  date: number;
  today?: boolean;
}

const DAYS: Day[] = [
  { dow: "Man", date: 11, today: true },
  { dow: "Tir", date: 12 },
  { dow: "Ons", date: 13 },
  { dow: "Tor", date: 14 },
  { dow: "Fre", date: 15 },
  { dow: "Lør", date: 16 },
  { dow: "Søn", date: 17 },
];

// 12 rader × 7 dager
const GRID: SlotState[][] = [
  ["past", "free", "booked", "free", "free", "free", "booked"],
  ["past", "free", "coach", "booked", "free", "booked", "booked"],
  ["past", "booked", "coach", "free", "free", "booked", "free"],
  ["past", "free", "free", "free", "free", "free", "free"],
  ["past", "booked", "free", "free", "booked", "booked", "free"],
  ["free", "coach", "free", "free", "free", "booked", "free"],
  ["free", "coach", "booked", "free", "free", "free", "free"],
  ["free", "free", "free", "selected", "free", "booked", "free"],
  ["booked", "booked", "free", "selected", "booked", "free", "booked"],
  ["booked", "free", "booked", "free", "booked", "free", "free"],
  ["free", "free", "free", "booked", "booked", "free", "free"],
  ["free", "booked", "booked", "free", "free", "free", "booked"],
];

export default function BookSessionDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 bg-black/60" aria-hidden="true" />

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
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Facility strip */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-secondary to-border text-muted-foreground">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
              >
                <rect x="4" y="6" width="24" height="18" rx="2" />
                <path d="M4 11h24" />
                <circle cx="16" cy="17" r="2.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-semibold">Mulligan Studio 1</div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                TrackMan 4 · 1 600 kr/t · 1,2 km
              </div>
            </div>
            <button
              type="button"
              className="ml-auto border-b border-primary text-[12px] font-semibold text-primary"
            >
              Endre
            </button>
          </div>

          {/* Week nav */}
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              UKE 20 · 11. – 17. MAI 2026
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Forrige uke"
                className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <span className="font-mono text-[12px] font-semibold text-foreground">Uke 20</span>
              <button
                type="button"
                aria-label="Neste uke"
                className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div
              className="grid"
              style={{ gridTemplateColumns: "42px repeat(7, minmax(0, 1fr))" }}
            >
              {/* Header row */}
              <div className="border-b border-border bg-secondary/60 p-2" />
              {DAYS.map((d) => (
                <div
                  key={d.dow}
                  className="border-b border-border border-l border-border/40 px-1 py-2 text-center"
                >
                  <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {d.dow}
                  </div>
                  <div
                    className={`mt-0.5 font-display text-[13px] font-semibold ${
                      d.today ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}

              {/* Rows */}
              {TIMES.map((hour, rowIdx) => (
                <div key={hour} className="contents">
                  <div className="flex items-center justify-end border-b border-border/40 border-r border-border bg-secondary/60 px-1 py-1 font-mono text-[10px] text-muted-foreground">
                    {hour}
                  </div>
                  {GRID[rowIdx].map((state, colIdx) => (
                    <Slot key={`${rowIdx}-${colIdx}`} state={state} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10.5px] text-muted-foreground">
            <LegendItem label="Ledig">
              <span className="h-3 w-3 rounded-sm border border-border bg-card" />
            </LegendItem>
            <LegendItem label="Coach (Anders) tilgj.">
              <span className="h-3 w-3 rounded-sm bg-primary/15" />
            </LegendItem>
            <LegendItem label="Booket">
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, hsl(var(--secondary)), hsl(var(--secondary)) 3px, hsl(var(--border)) 3px, hsl(var(--border)) 6px)",
                }}
              />
            </LegendItem>
            <LegendItem label="Ditt valg">
              <span className="h-3 w-3 rounded-sm border-[1.5px] border-primary bg-accent" />
            </LegendItem>
          </div>

          {/* Selected bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3.5">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                Valgt
              </div>
              <div className="mt-0.5 font-display text-[15px] font-semibold text-foreground">
                Torsdag 14. mai · 16:30 – 17:30
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[18px] font-semibold tabular-nums text-foreground">
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
            i <= active ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function Slot({ state }: { state: SlotState }) {
  const base = "h-[26px] border-b border-border/40 border-l border-border/40 relative";
  if (state === "selected") {
    return (
      <div className={`${base} bg-accent`}>
        <span className="absolute inset-[2px] rounded-sm border-2 border-primary" />
      </div>
    );
  }
  if (state === "booked") {
    return (
      <div
        className={`${base} cursor-not-allowed`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, hsl(var(--secondary)), hsl(var(--secondary)) 3px, hsl(var(--border)) 3px, hsl(var(--border)) 6px)",
        }}
      />
    );
  }
  if (state === "past") {
    return <div className={`${base} cursor-not-allowed bg-secondary/60 opacity-50`} />;
  }
  if (state === "coach") {
    return (
      <div className={`${base} cursor-pointer bg-primary/15`}>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-primary">
          A
        </span>
      </div>
    );
  }
  return <div className={`${base} cursor-pointer hover:bg-accent/60`} />;
}

function LegendItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {label}
    </span>
  );
}
