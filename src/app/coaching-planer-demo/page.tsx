/**
 * DEMO — PlayerHQ Coaching-planer (kanban)
 * Spec: design2.0/06-playerhq-B/spec.md (Pakke 2/5)
 * URL: /coaching-planer-demo
 *
 * Default state: Pro, alle 3 kolonner med data, lyst tema. Ingen sidebar/shell.
 */

import {
  Search,
  ArrowUpRight,
  ChevronDown,
  Check,
  X,
  ChevronRight,
} from "lucide-react";

type PlanCard = {
  title: string;
  period: string;
  status: "Foreslått" | "Aktiv" | "Ferdig";
  pyramid: { fys: number; tek: number; slag: number; spill: number; turn: number };
  progress?: number;
  doneNote?: string;
};

const FORESLATT: PlanCard[] = [
  {
    title: "Pre-sesong juni",
    period: "1. juni – 21. juni 2026",
    status: "Foreslått",
    pyramid: { fys: 4, tek: 3, slag: 2, spill: 1, turn: 0 },
  },
  {
    title: "Putte-blokk juli",
    period: "1. juli – 21. juli 2026",
    status: "Foreslått",
    pyramid: { fys: 1, tek: 2, slag: 4, spill: 3, turn: 1 },
  },
];

const AKTIV: PlanCard[] = [
  {
    title: "Sommer-toppform",
    period: "9. mai – 30. juni 2026",
    status: "Aktiv",
    pyramid: { fys: 2, tek: 4, slag: 3, spill: 3, turn: 2 },
    progress: 64,
  },
];

const FERDIG: PlanCard[] = [
  {
    title: "Putte-fokus mai",
    period: "6. mai – 31. mai 2026",
    status: "Ferdig",
    pyramid: { fys: 1, tek: 2, slag: 4, spill: 2, turn: 1 },
    doneNote: "Avsluttet 31. mai",
  },
  {
    title: "Vinter-styrke",
    period: "10. jan – 28. feb 2026",
    status: "Ferdig",
    pyramid: { fys: 5, tek: 2, slag: 1, spill: 1, turn: 0 },
    doneNote: "Avsluttet 28. feb",
  },
];

export default function CoachingPlanerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <button className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
            Min coach
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coaching · Planer
          </span>
          <h1 className="mt-2 font-display text-[36px] italic font-medium leading-[1.05] tracking-tight">
            1 aktiv plan, Markus. 2 forslag venter.
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
            Anders K. har sendt 2 nye forslag for juni–juli. Godta eller avvis i Foreslått-kolonnen.
          </p>
        </header>

        {/* Filter-bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Søk planer …"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <FilterChip label="Coach" value="Anders K" />
          <FilterChip label="Periode" value="Inneværende" />
          <FilterChip label="Fokus" value="Alle" />
          <FilterChip label="Sort" value="Sist endret" />
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr_1fr]">
          {/* Foreslått */}
          <Column
            title="Foreslått"
            count={FORESLATT.length}
            tone="accent"
            description="Krever ditt svar"
          >
            {FORESLATT.map((p) => (
              <PlanCardEl key={p.title} card={p} />
            ))}
          </Column>

          {/* Aktiv */}
          <Column
            title="Aktiv"
            count={AKTIV.length}
            tone="primary"
            description="Følger denne nå"
          >
            {AKTIV.map((p) => (
              <PlanCardEl key={p.title} card={p} />
            ))}
          </Column>

          {/* Ferdig */}
          <Column
            title="Ferdig"
            count={FERDIG.length}
            tone="muted"
            description="Arkiv siste 12 mnd"
            collapsedDefault
          >
            {FERDIG.map((p) => (
              <PlanCardEl key={p.title} card={p} />
            ))}
          </Column>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent/30">
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <ChevronDown size={12} strokeWidth={1.5} />
    </button>
  );
}

function Column({
  title,
  count,
  tone,
  description,
  collapsedDefault,
  children,
}: {
  title: string;
  count: number;
  tone: "accent" | "primary" | "muted";
  description: string;
  collapsedDefault?: boolean;
  children: React.ReactNode;
}) {
  const dotCls =
    tone === "accent"
      ? "bg-accent"
      : tone === "primary"
        ? "bg-primary"
        : "bg-muted-foreground/50";
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <header className="mb-4 flex items-center gap-3 border-b border-border pb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotCls}`} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[16px] font-semibold leading-none">{title}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
          {count}
        </span>
      </header>
      <div className="space-y-3">
        {collapsedDefault ? (
          <details>
            <summary className="cursor-pointer list-none rounded-md border border-dashed border-border bg-secondary/50 px-4 py-3 text-center text-[12px] font-medium text-muted-foreground hover:bg-secondary">
              Vis {count} ferdige planer
            </summary>
            <div className="mt-3 space-y-3">{children}</div>
          </details>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function PlanCardEl({ card }: { card: PlanCard }) {
  const isForeslatt = card.status === "Foreslått";
  const isAktiv = card.status === "Aktiv";
  return (
    <article className="rounded-md border border-border bg-card p-4 transition-shadow hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
          AK
        </div>
        <span className="text-[11px] text-muted-foreground">Anders K.</span>
        <StatusPill status={card.status} />
      </div>

      <h3 className="mt-3 font-display text-[18px] italic font-medium leading-snug text-foreground">
        {card.title}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{card.period}</p>

      {/* Pyramide-fokus-prikker */}
      <div className="mt-3 flex items-center gap-3 text-[10px]">
        <PyrDot label="FYS" filled={card.pyramid.fys} color="#16A34A" />
        <PyrDot label="TEK" filled={card.pyramid.tek} color="#005840" />
        <PyrDot label="SLAG" filled={card.pyramid.slag} color="#D1F843" />
        <PyrDot label="SPILL" filled={card.pyramid.spill} color="#F4C430" />
        <PyrDot label="TURN" filled={card.pyramid.turn} color="#5E5C57" />
      </div>

      {isAktiv && card.progress !== undefined ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Fremdrift</span>
            <span className="font-mono font-semibold text-foreground">{card.progress} %</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-accent" style={{ width: `${card.progress}%` }} />
          </div>
        </div>
      ) : null}

      {card.doneNote ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {card.doneNote}
        </p>
      ) : null}

      <footer className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <button className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:underline">
          Detaljer
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </button>
        {isForeslatt ? (
          <div className="ml-auto flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
              <X size={12} strokeWidth={1.5} />
              Avvis
            </button>
            <button className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[11px] font-semibold text-accent-foreground hover:opacity-90">
              <Check size={12} strokeWidth={1.5} />
              Godta
            </button>
          </div>
        ) : null}
      </footer>
    </article>
  );
}

function StatusPill({ status }: { status: PlanCard["status"] }) {
  const cls =
    status === "Foreslått"
      ? "bg-accent/30 text-foreground"
      : status === "Aktiv"
        ? "bg-primary/10 text-primary"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function PyrDot({ label, filled, color }: { label: string; filled: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: filled > 0 ? color : "transparent",
          border: filled > 0 ? "none" : `1px solid ${color}40`,
          opacity: filled > 0 ? Math.min(1, 0.4 + filled * 0.15) : 0.4,
        }}
      />
      <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
