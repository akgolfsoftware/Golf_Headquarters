/**
 * Booking — Velg coach (steg 2 av 5)
 * Bygd fra wireframe/design-files-v2/screens/booking/03-booking-coaches.html
 * URL: /booking-coaches-demo
 *
 * Coach-liste forbruker. 6 coacher med live tilgjengelighet.
 */

import { Check, ChevronDown, Circle } from "lucide-react";

const STEPS = [
  { num: "✓", label: "Tjeneste", state: "done" as const },
  { num: "2", label: "Coach", state: "active" as const },
  { num: "3", label: "Tid", state: "todo" as const },
  { num: "4", label: "Info", state: "todo" as const },
  { num: "5", label: "Betaling", state: "todo" as const },
];

type Availability = "good" | "warn" | "danger";

interface Coach {
  id: string;
  initials: string;
  name: string;
  spec: string;
  availability: Availability;
  availableLabel: string;
  disabled?: boolean;
}

const COACHES: Coach[] = [
  {
    id: "anders",
    initials: "AK",
    name: "Anders Kristiansen",
    spec: "PGA · Scoring · Mulligan Borre",
    availability: "good",
    availableLabel: "12 ledige tider denne uka",
  },
  {
    id: "sara",
    initials: "SP",
    name: "Sara Pedersen",
    spec: "Junior · Teknikk · GFGK Bossum",
    availability: "good",
    availableLabel: "8 ledige tider denne uka",
  },
  {
    id: "tom",
    initials: "TA",
    name: "Tom Andersen",
    spec: "Putt · Mental · Bossum",
    availability: "warn",
    availableLabel: "3 ledige tider denne uka",
  },
  {
    id: "marius",
    initials: "ML",
    name: "Marius Lund",
    spec: "TrackMan-spesialist · Mulligan Borre",
    availability: "good",
    availableLabel: "14 ledige tider denne uka",
  },
  {
    id: "eva",
    initials: "EB",
    name: "Eva Bakke",
    spec: "Long game · Mulligan Borre",
    availability: "danger",
    availableLabel: "Fullt denne uka — neste ledig 20. mai",
    disabled: true,
  },
  {
    id: "per",
    initials: "PH",
    name: "Per Holm",
    spec: "Begynner · GFGK Bossum",
    availability: "good",
    availableLabel: "9 ledige tider denne uka",
  },
];

const FILTERS = ["Spesialitet: Alle", "Anlegg: Alle"];

export default function BookingCoachesDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1000px] px-12 pb-16 pt-12">
        <div className="text-center">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Personlig coaching · 60 min · 1 500 kr
          </div>
          <h1 className="mt-3 font-display text-[44px] font-normal leading-tight tracking-tight">
            Velg <em className="italic text-primary">coach</em>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            6 coacher tilgjengelig. Grønn prikk = ledig denne uka, gul = noen ledige, rød = fullt.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Filter:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium hover:border-foreground"
            >
              {f}
              <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium hover:border-foreground"
          >
            Kun ledige
            <Circle className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {COACHES.map((c) => (
            <CoachCard key={c.id} coach={c} />
          ))}
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

function CoachCard({ coach }: { coach: Coach }) {
  const dotColor: Record<Availability, string> = {
    good: "bg-[#16A34A]",
    warn: "bg-[#F4C430]",
    danger: "bg-destructive",
  };
  return (
    <button
      type="button"
      disabled={coach.disabled}
      className={`flex items-center gap-5 rounded-2xl border border-border bg-card p-6 text-left transition-colors ${
        coach.disabled
          ? "opacity-60"
          : "hover:border-primary"
      }`}
    >
      <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[18px] font-bold text-primary">
        {coach.initials}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[22px] font-normal italic leading-tight tracking-tight">
          {coach.name}
        </h3>
        <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {coach.spec}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          <span className={`h-2 w-2 rounded-full ${dotColor[coach.availability]}`} />
          {coach.availability === "danger" ? (
            <span className="text-muted-foreground">{coach.availableLabel}</span>
          ) : (
            <span>
              <b className="font-mono font-medium text-primary">
                {coach.availableLabel.split(" ")[0]} {coach.availableLabel.split(" ")[1]}
              </b>{" "}
              tider denne uka
            </span>
          )}
        </div>
        <a
          href="#"
          className="mt-2 inline-block text-[12px] text-foreground underline decoration-border underline-offset-2"
        >
          Se profil →
        </a>
      </div>
      {!coach.disabled && (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      )}
    </button>
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
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Klikk en coach for å fortsette
      </span>
    </footer>
  );
}
