/**
 * Booking — Kalender + tidsluker (steg 3 av 5)
 * Bygd fra wireframe/design-files-v2/screens/booking/04-booking-kalender.html
 * URL: /booking-kalender-demo
 *
 * Kalender venstre, tidsluker høyre. Tirsdag 13. mai 2026 valgt med 09:00 valgt.
 * Sticky bekreft-CTA i footer.
 */

import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { num: "✓", label: "Tjeneste", state: "done" as const },
  { num: "✓", label: "Coach", state: "done" as const },
  { num: "3", label: "Tid", state: "active" as const },
  { num: "4", label: "Info", state: "todo" as const },
  { num: "5", label: "Betaling", state: "todo" as const },
];

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

type DayState = "out" | "full" | "today" | "active" | "free";

interface CalDay {
  n: number;
  state: DayState;
}

// Mai 2026 — 1. mai er fredag
const DAYS: CalDay[] = [
  { n: 27, state: "out" },
  { n: 28, state: "out" },
  { n: 29, state: "out" },
  { n: 30, state: "out" },
  { n: 1, state: "full" },
  { n: 2, state: "free" },
  { n: 3, state: "full" },
  { n: 4, state: "full" },
  { n: 5, state: "free" },
  { n: 6, state: "free" },
  { n: 7, state: "free" },
  { n: 8, state: "full" },
  { n: 9, state: "free" },
  { n: 10, state: "full" },
  { n: 11, state: "today" },
  { n: 12, state: "free" },
  { n: 13, state: "active" },
  { n: 14, state: "free" },
  { n: 15, state: "free" },
  { n: 16, state: "free" },
  { n: 17, state: "full" },
  { n: 18, state: "full" },
  { n: 19, state: "free" },
  { n: 20, state: "free" },
  { n: 21, state: "free" },
  { n: 22, state: "free" },
  { n: 23, state: "free" },
  { n: 24, state: "full" },
  { n: 25, state: "full" },
  { n: 26, state: "free" },
  { n: 27, state: "free" },
  { n: 28, state: "free" },
  { n: 29, state: "free" },
  { n: 30, state: "free" },
  { n: 31, state: "full" },
  { n: 1, state: "out" },
];

interface Slot {
  time: string;
  state: "free" | "selected" | "busy";
}

const SLOTS_MORGEN: Slot[] = [
  { time: "08:00", state: "free" },
  { time: "09:00", state: "selected" },
  { time: "10:00", state: "busy" },
  { time: "11:00", state: "free" },
];

const SLOTS_DAG: Slot[] = [
  { time: "13:00", state: "free" },
  { time: "14:00", state: "busy" },
  { time: "15:00", state: "free" },
];

const SLOTS_KVELD: Slot[] = [
  { time: "17:00", state: "free" },
  { time: "18:00", state: "free" },
  { time: "19:00", state: "free" },
];

export default function BookingKalenderDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1040px] px-12 pb-16 pt-12">
        <div className="text-center">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Anders Kristiansen · 60 min · 1 500 kr · Mulligan Borre
          </div>
          <h1 className="mt-3 font-display text-[44px] font-normal leading-tight tracking-tight">
            Velg <em className="italic text-primary">tid</em>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Velg en dato i kalenderen for å se ledige tidsluker. Grønn prikk markerer dager med ledighet.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_1.1fr] items-start gap-8">
          <Calendar />
          <Slots />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-border px-12">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>AK Golf</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Booking</span>
      </div>
      <a href="#" className="text-[13px] font-medium hover:text-primary">
        Min side →
      </a>
    </nav>
  );
}

function ProgressBar() {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-secondary/40 px-12 py-4">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              step.state === "active"
                ? "bg-primary text-primary-foreground"
                : step.state === "done"
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${
                step.state === "active"
                  ? "bg-primary-foreground/20"
                  : step.state === "done"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary"
              }`}
            >
              {step.num}
            </span>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-border">→</span>}
        </div>
      ))}
    </div>
  );
}

function Calendar() {
  return (
    <div>
      <h3 className="mb-4 font-display text-[22px] font-normal italic leading-tight tracking-tight">
        Kalender
      </h3>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-[20px] italic">Mai 2026</span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Forrige måned"
              className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Neste måned"
              className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-secondary"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1 text-center">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {DAYS.map((d, i) => (
            <CalDayBtn key={i} day={d} />
          ))}
        </div>
        <div className="mt-4 flex gap-4 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Ledig
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full border border-border" />
            Fullt
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
            Valgt
          </span>
        </div>
      </div>
    </div>
  );
}

function CalDayBtn({ day }: { day: CalDay }) {
  const base =
    "relative aspect-square flex flex-col items-center justify-center gap-0.5 rounded-md border border-transparent text-[13px] transition-colors";
  if (day.state === "out") {
    return (
      <span className={`${base} text-muted-foreground/40`}>
        <span className="font-mono">{day.n}</span>
      </span>
    );
  }
  if (day.state === "full") {
    return (
      <span className={`${base} cursor-not-allowed text-muted-foreground/40 line-through`}>
        <span className="font-mono">{day.n}</span>
      </span>
    );
  }
  if (day.state === "active") {
    return (
      <button
        type="button"
        className={`${base} border-foreground bg-foreground text-background`}
      >
        <span className="font-mono font-medium">{day.n}</span>
        <span className="h-1 w-1 rounded-full bg-accent" />
      </button>
    );
  }
  if (day.state === "today") {
    return (
      <button
        type="button"
        className={`${base} border-border hover:bg-secondary`}
      >
        <span className="font-mono font-medium">{day.n}</span>
        <span className="h-1 w-1 rounded-full bg-primary" />
      </button>
    );
  }
  return (
    <button type="button" className={`${base} hover:bg-secondary`}>
      <span className="font-mono font-medium">{day.n}</span>
      <span className="h-1 w-1 rounded-full bg-primary" />
    </button>
  );
}

function Slots() {
  return (
    <div>
      <h3 className="mb-4 font-display text-[22px] font-normal italic leading-tight tracking-tight">
        Tidsluker
      </h3>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <span className="font-display text-[22px] italic">Tirsdag 13. mai</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            1 valgt · 7 andre ledige
          </span>
        </div>

        <SlotGroup label="Morgen" slots={SLOTS_MORGEN} />
        <SlotGroup label="Dag" slots={SLOTS_DAG} />
        <SlotGroup label="Kveld" slots={SLOTS_KVELD} />

        <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Valgt tid
            </div>
            <div className="mt-0.5 text-[14px]">
              <em className="font-display italic">Tirsdag 13. mai</em> kl 09:00 — 10:00 · 60 min med Anders K
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotGroup({ label, slots }: { label: string; slots: Slot[] }) {
  return (
    <>
      <div className="mb-2 mt-4 border-b border-border pb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((s) => (
          <button
            key={s.time}
            type="button"
            disabled={s.state === "busy"}
            className={`flex flex-col items-center justify-center rounded-md border px-2 py-3 transition-colors ${
              s.state === "selected"
                ? "border-foreground bg-foreground text-background"
                : s.state === "busy"
                  ? "cursor-not-allowed border-border bg-background opacity-40"
                  : "border-border bg-background hover:border-foreground hover:bg-secondary"
            }`}
          >
            <span
              className={`font-mono text-[13px] font-medium ${
                s.state === "busy" ? "line-through" : ""
              }`}
            >
              {s.time}
            </span>
            <span
              className={`mt-0.5 text-[10px] ${
                s.state === "selected" ? "text-background/80" : "text-muted-foreground"
              }`}
            >
              {s.state === "selected" ? "valgt" : s.state === "busy" ? "opptatt" : "60 min"}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-5">
      <button
        type="button"
        className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium hover:bg-secondary"
      >
        ← Tilbake
      </button>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
      >
        Fortsett til info →
      </button>
    </footer>
  );
}
