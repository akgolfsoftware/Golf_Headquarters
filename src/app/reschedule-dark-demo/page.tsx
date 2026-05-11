/**
 * DEMO — RescheduleBookingModal · Dark
 * Bygd fra wireframe modal-C/02-reschedule-dark.html
 * URL: /reschedule-dark-demo
 */

import { ArrowRight, Info, X } from "lucide-react";

type SlotState = "free" | "booked" | "past" | "curr";

const TIMES = ["12", "13", "14", "15", "16", "17", "18"] as const;
interface Day {
  dow: string;
  date: number;
  highlight?: boolean;
}

const DAYS: Day[] = [
  { dow: "Man", date: 11 },
  { dow: "Tir", date: 12 },
  { dow: "Ons", date: 13 },
  { dow: "Tor", date: 14, highlight: true },
  { dow: "Fre", date: 15 },
  { dow: "Lør", date: 16 },
  { dow: "Søn", date: 17 },
];

const GRID: SlotState[][] = [
  ["past", "free", "free", "free", "free", "free", "free"],
  ["past", "booked", "free", "free", "booked", "booked", "free"],
  ["free", "free", "free", "free", "free", "booked", "free"],
  ["free", "booked", "booked", "free", "free", "free", "free"],
  ["free", "free", "free", "curr", "free", "booked", "free"],
  ["booked", "booked", "free", "curr", "booked", "free", "booked"],
  ["booked", "free", "booked", "free", "booked", "free", "free"],
];

export default function RescheduleDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 bg-black/60" aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-7 pb-5 pt-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span>Booking #BK-2026-0421</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>Med Anders Kristiansen</span>
            </div>
            <h2 className="mt-1.5 font-display text-[24px] font-semibold leading-tight tracking-tight text-foreground">
              Flytt booking
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="px-7 py-6">
          {/* Before/After */}
          <div className="mb-5 grid items-center gap-2.5" style={{ gridTemplateColumns: "1fr 32px 1fr" }}>
            <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 opacity-65">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Nåværende
              </div>
              <div className="mt-1 font-display text-[14px] font-semibold text-foreground line-through">
                Tor 14. mai · 16:30–17:30
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Mulligan Studio 1 · 1 600 kr
              </div>
            </div>
            <div className="flex justify-center text-muted-foreground">
              <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary bg-primary/10 px-4 py-3">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-primary">
                Ny tid
              </div>
              <div className="mt-1 font-display text-[14px] italic text-muted-foreground">
                Velg en ledig slot under
              </div>
            </div>
          </div>

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            UKE 20 · LEDIGE TIDER · MULLIGAN STUDIO 1
          </span>

          {/* Calendar grid */}
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid" style={{ gridTemplateColumns: "42px repeat(7, minmax(0, 1fr))" }}>
              <div className="border-b border-border bg-secondary/60 p-2" />
              {DAYS.map((d) => (
                <div
                  key={d.dow}
                  className="border-b border-border border-l border-border/40 px-1 py-2 text-center"
                >
                  <div
                    className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${
                      d.highlight ? "text-amber-500" : "text-muted-foreground"
                    }`}
                  >
                    {d.dow}
                  </div>
                  <div
                    className={`mt-0.5 font-display text-[13px] font-semibold ${
                      d.highlight ? "text-amber-500" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}

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

          {/* Reason */}
          <div className="mt-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              GRUNN (VALGFRI · SENDES TIL ANDERS)
            </span>
            <textarea
              rows={3}
              placeholder="Skriv kort hvorfor du flytter — Anders ser dette. F.eks. «Jobb-møte kom inn på samme tid»"
              className="mt-2 w-full resize-none rounded-md border border-input bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Info */}
          <div className="mt-4 flex gap-2.5 rounded-lg border border-border bg-secondary/40 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" strokeWidth={1.75} />
            <span>
              <b className="font-semibold text-foreground">Anders får varsel</b> og kan godta/avvise innen
              24 t. Avbestillingsfrist for den gamle tiden er <b className="font-semibold text-foreground">15. mai kl. 16:30</b> — du har god margin.
            </span>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-7 py-4">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
          >
            Bekreft flytting
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function Slot({ state }: { state: SlotState }) {
  const base = "h-[24px] border-b border-border/40 border-l border-border/40 relative";
  if (state === "curr") {
    return (
      <div className={`${base} bg-amber-500/20`}>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[8.5px] font-bold text-amber-500">
          NÅ
        </span>
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
  return <div className={`${base} cursor-pointer hover:bg-accent/60`} />;
}
