/**
 * PILOT — RescheduleBookingModal · default
 * Bygd direkte fra wireframe/modal-C/02-reschedule-default.html
 * URL: /reschedule-default-demo
 *
 * Mock: Markus vil flytte BK-2026-0421 med Anders Kristiansen.
 */

import { X, ArrowRight, Info } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type SlotState = "free" | "booked" | "past" | "curr";

const HOURS = [12, 13, 14, 15, 16, 17, 18];

const GRID: SlotState[][] = [
  // 12
  ["past", "free", "free", "free", "free", "free", "free"],
  // 13
  ["past", "booked", "free", "free", "booked", "booked", "free"],
  // 14
  ["free", "free", "free", "free", "free", "booked", "free"],
  // 15
  ["free", "booked", "booked", "free", "free", "free", "free"],
  // 16
  ["free", "free", "free", "curr", "free", "booked", "free"],
  // 17
  ["booked", "booked", "free", "curr", "booked", "free", "booked"],
  // 18
  ["booked", "free", "booked", "free", "booked", "free", "free"],
];

const DAYS = [
  { dow: "Man", date: "11" },
  { dow: "Tir", date: "12" },
  { dow: "Ons", date: "13" },
  { dow: "Tor", date: "14", current: true },
  { dow: "Fre", date: "15" },
  { dow: "Lør", date: "16" },
  { dow: "Søn", date: "17" },
];

export default function RescheduleDefaultDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span>Booking #BK-2026-0421</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>Med Anders Kristiansen</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Flytt booking
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Before/After */}
          <div className="mb-5 grid grid-cols-[1fr_32px_1fr] items-center gap-2.5">
            <div className="rounded-xl border border-border bg-background px-4 py-3.5 opacity-65">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Nåværende
              </div>
              <div className="mt-1.5 font-display text-[14px] font-semibold text-foreground line-through">
                Tor 14. mai · 16:30–17:30
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Mulligan Studio 1 · 1 600 kr
              </div>
            </div>
            <div className="flex justify-center text-muted-foreground">
              <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary bg-primary/[0.06] px-4 py-3.5">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-primary">
                Ny tid
              </div>
              <div className="mt-1.5 font-display text-[14px] italic text-muted-foreground">
                Velg en ledig slot under
              </div>
            </div>
          </div>

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
            Uke 20 · ledige tider · Mulligan Studio 1
          </span>

          {/* Calendar grid */}
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[42px_repeat(7,1fr)]">
              <div className="border-b border-r border-border bg-secondary/60 px-1 py-2" />
              {DAYS.map((d, i) => (
                <div
                  key={d.date}
                  className={`border-b border-border px-1 py-2 text-center ${
                    i < DAYS.length - 1 ? "border-r border-border/40" : ""
                  } bg-background`}
                >
                  <div
                    className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${
                      d.current ? "text-[#B8852A]" : "text-muted-foreground"
                    }`}
                  >
                    {d.dow}
                  </div>
                  <div
                    className={`font-display text-[13px] font-semibold ${
                      d.current ? "text-[#B8852A]" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}

              {GRID.map((row, rowIdx) => (
                <Row key={HOURS[rowIdx]} hour={HOURS[rowIdx]} cells={row} />
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="mt-4.5 mt-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Grunn (valgfri · sendes til Anders)
            </span>
            <textarea
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="Skriv kort hvorfor du flytter — Anders ser dette. F.eks. «Jobb-møte kom inn på samme tid»"
            />
          </div>

          {/* Info card */}
          <div className="mt-3.5 flex items-start gap-2.5 rounded-md border border-border bg-background px-3.5 py-2.5 text-[12.5px] leading-[1.5] text-muted-foreground">
            <Info className="mt-px h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.5} />
            <span>
              <b className="font-semibold text-foreground">Anders får varsel</b> og kan godta/avvise innen 24 t.
              Avbestillingsfrist for den gamle tiden er{" "}
              <b className="font-semibold text-foreground">15. mai kl. 16:30</b> — du har god margin.
            </span>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-primary/40 px-3.5 py-2 text-[13px] font-medium text-primary-foreground/70 cursor-not-allowed"
          >
            Bekreft flytting
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
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
  const base = `relative h-6 border-b border-border/40 ${last ? "" : "border-r border-border/40"}`;

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
  return (
    <div className={`${base} cursor-not-allowed bg-[rgba(184,133,42,0.18)]`}>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[8.5px] font-bold text-[#B8852A]">
        NÅ
      </span>
    </div>
  );
}
