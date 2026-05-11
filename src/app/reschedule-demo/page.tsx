/**
 * PILOT — RescheduleBookingModal (default)
 * Bygd direkte fra wireframe/design-files-v2/modaler-C/02-reschedule-default.html
 * URL: /reschedule-demo
 *
 * Mock-data: Booking #BK-2026-0421 med Anders. Markus flytter fra tor 14. mai 16:30–17:30.
 */

import { X, ArrowRight, Info } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type SlotState = "free" | "booked" | "past" | "curr";

const DAYS = [
  { dow: "Man", date: "11" },
  { dow: "Tir", date: "12" },
  { dow: "Ons", date: "13" },
  { dow: "Tor", date: "14", current: true },
  { dow: "Fre", date: "15" },
  { dow: "Lør", date: "16" },
  { dow: "Søn", date: "17" },
];

const HOURS: Array<{ hour: string; slots: SlotState[] }> = [
  { hour: "12", slots: ["past", "free", "free", "free", "free", "free", "free"] },
  { hour: "13", slots: ["past", "booked", "free", "free", "booked", "booked", "free"] },
  { hour: "14", slots: ["free", "free", "free", "free", "free", "booked", "free"] },
  { hour: "15", slots: ["free", "booked", "booked", "free", "free", "free", "free"] },
  { hour: "16", slots: ["free", "free", "free", "curr", "free", "booked", "free"] },
  { hour: "17", slots: ["booked", "booked", "free", "curr", "booked", "free", "booked"] },
  { hour: "18", slots: ["booked", "free", "booked", "free", "booked", "free", "free"] },
];

export default function RescheduleDemo() {
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
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Before / After */}
          <div className="mb-5 grid grid-cols-[1fr_32px_1fr] items-center gap-2.5">
            <div className="rounded-xl border border-border bg-background p-4 opacity-65">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Nåværende
              </div>
              <div className="mt-1 font-display text-[14px] font-semibold text-foreground line-through">
                Tor 14. mai · 16:30–17:30
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Mulligan Studio 2 · 1 600 kr
              </div>
            </div>
            <div className="flex justify-center text-muted-foreground/60">
              <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary bg-primary/5 p-4">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-primary">
                Ny tid
              </div>
              <div className="mt-1 font-display text-[14px] italic text-muted-foreground/70">
                Velg en ledig slot under
              </div>
            </div>
          </div>

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
            Uke 20 · ledige tider · Mulligan Studio 2
          </span>

          {/* Calendar grid */}
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[42px_repeat(7,1fr)] border-b border-border bg-background">
              <div className="bg-secondary/60" />
              {DAYS.map((d) => (
                <div
                  key={d.date}
                  className="border-l border-border/40 px-1 py-1.5 text-center first:border-l-0"
                >
                  <div
                    className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] ${
                      d.current ? "text-[#B8860B]" : "text-muted-foreground"
                    }`}
                  >
                    {d.dow}
                  </div>
                  <div
                    className={`font-display text-[13px] font-semibold ${
                      d.current ? "text-[#B8860B]" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
            {HOURS.map((row) => (
              <div
                key={row.hour}
                className="grid grid-cols-[42px_repeat(7,1fr)] border-b border-border/40 last:border-b-0"
              >
                <div className="flex items-center justify-end border-r border-border/60 bg-secondary/60 p-1 font-mono text-[10px] text-muted-foreground/70">
                  {row.hour}
                </div>
                {row.slots.map((s, i) => (
                  <Slot key={i} state={s} />
                ))}
              </div>
            ))}
          </div>

          {/* Reason */}
          <div className="mt-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Grunn (valgfri · sendes til Anders)
            </span>
            <textarea
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              rows={3}
              placeholder="Skriv kort hvorfor du flytter — Anders ser dette. F.eks. «Jobb-møte kom inn på samme tid»"
            />
          </div>

          <div className="mt-3.5 flex items-start gap-2.5 rounded-md border border-border bg-background px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.75} />
            <span>
              <b className="font-semibold text-foreground">Anders får varsel</b> og kan godta/avvise
              innen 24 t. Avbestillingsfrist for den gamle tiden er{" "}
              <b className="font-semibold text-foreground">15. mai kl. 16:30</b> — du har god margin.
            </span>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-primary/40 px-3.5 py-2 text-[13px] font-medium text-primary-foreground"
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
  const base = "h-6 border-l border-border/40 first:border-l-0";
  if (state === "free") {
    return <div className={`${base} cursor-pointer hover:bg-accent/40`} />;
  }
  if (state === "booked") {
    return (
      <div
        className={`${base} cursor-not-allowed`}
        style={{
          background:
            "repeating-linear-gradient(45deg, hsl(var(--secondary)), hsl(var(--secondary)) 3px, hsl(var(--border)) 3px, hsl(var(--border)) 6px)",
        }}
      />
    );
  }
  if (state === "past") {
    return <div className={`${base} bg-secondary/60 opacity-50`} />;
  }
  return (
    <div className={`${base} relative bg-[rgba(184,133,42,0.18)]`}>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[8.5px] font-bold text-[#B8860B]">
        NÅ
      </span>
    </div>
  );
}
