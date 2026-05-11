/**
 * DEMO — CoachHQ Talent-pipeline (A1–A3, kanban)
 * Spec: design2.0/04-coachhq-D/spec.md (Pakke 1/2)
 * URL: /talent-demo
 *
 * Default state: Pipeline-tab, lyst tema. Ingen sidebar/shell.
 */

import {
  Plus,
  Download,
  AlertTriangle,
  GripVertical,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

type TalentCardData = {
  initials: string;
  name: string;
  age: number;
  club: string;
  hcp: string;
  volume: number; // 0–5, antall fylte pyramide-prikker
  flag?: "promo" | "risiko";
  flagText?: string;
};

const A1_CARDS: TalentCardData[] = [
  { initials: "MP", name: "Markus Roinås Pedersen", age: 17, club: "WANG Toppidrett", hcp: "+2,4", volume: 5 },
  { initials: "LH", name: "Lina Hellesund", age: 18, club: "GFGK", hcp: "4,1", volume: 4 },
  { initials: "NV", name: "Nora Vik", age: 16, club: "Borre GK", hcp: "5,8", volume: 4 },
  {
    initials: "AN",
    name: "Anders Nedrum",
    age: 17,
    club: "GFGK",
    hcp: "5,2",
    volume: 5,
    flag: "promo",
    flagText: "Promo-kandidat · 12 økter siste mnd",
  },
  { initials: "MB", name: "Mia Berg", age: 16, club: "WANG Toppidrett", hcp: "4,9", volume: 4, flag: "promo", flagText: "Promo-kandidat" },
];

const A2_CARDS: TalentCardData[] = [
  { initials: "HN", name: "Henrik Nilsen", age: 19, club: "GFGK", hcp: "8,7", volume: 4 },
  { initials: "ES", name: "Emma Solberg", age: 18, club: "Mulligan", hcp: "8,7", volume: 3 },
  { initials: "MR", name: "Mads Rønning", age: 20, club: "Borre GK", hcp: "9,4", volume: 3 },
  {
    initials: "JT",
    name: "Joachim Tangen",
    age: 21,
    club: "GFGK",
    hcp: "14,2",
    volume: 1,
    flag: "risiko",
    flagText: "Skadet 18 dager · agent flagger",
  },
];

const A3_CARDS: TalentCardData[] = [
  { initials: "AK", name: "Anna Karlsen", age: 15, club: "GFGK", hcp: "16,8", volume: 3 },
  { initials: "LS", name: "Lise Sandberg", age: 16, club: "WANG Toppidrett", hcp: "19,5", volume: 2 },
];

const TABS = ["Pipeline", "Promosjoner", "Risiko", "Talent-tester", "Historikk"] as const;

export default function TalentDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-8 py-10">
        {/* Hero */}
        <header className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Talent
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold leading-[1.05] tracking-tight">
            Talent-pipeline
          </h1>
          <p className="mt-2 max-w-xl font-display text-[18px] italic leading-snug text-muted-foreground">
            Hvem er klar for løft, hvem trenger en pause.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatPill>14 i pipeline</StatPill>
            <StatPill tone="accent">3 promo-kandidater</StatPill>
            <StatPill tone="warning">2 risiko</StatPill>
            <StatPill>Sist endret: 8. mai</StatPill>

            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Download size={16} strokeWidth={1.5} />
                Eksporter
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                <Plus size={16} strokeWidth={1.5} />
                Manuell endring
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="mb-8 flex gap-1 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`relative px-4 py-3 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Kanban-rader */}
        <div className="space-y-6">
          <KanbanRow
            tag="A1"
            title="Elite"
            description="3 aktive · 2 promo-kandidater"
            badgeTone="primary"
            cards={A1_CARDS}
          />
          <KanbanRow
            tag="A2"
            title="Pro"
            description="4 aktive · 1 risiko"
            badgeTone="muted"
            cards={A2_CARDS}
            extraCount={1}
          />
          <KanbanRow
            tag="A3"
            title="Free"
            description="2 av 4 vist"
            badgeTone="muted"
            cards={A3_CARDS}
            extraCount={2}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "warning";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-muted-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
    warning: "bg-[#FFF0D6] text-[#B8852A] border-[#F4C430]/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function KanbanRow({
  tag,
  title,
  description,
  badgeTone,
  cards,
  extraCount,
}: {
  tag: string;
  title: string;
  description: string;
  badgeTone: "primary" | "muted";
  cards: TalentCardData[];
  extraCount?: number;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <header className="mb-5 flex items-center gap-4">
        <span
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-mono text-[13px] font-semibold ${
            badgeTone === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          }`}
        >
          {tag}
        </span>
        <div>
          <h2 className="font-display text-[18px] font-semibold leading-none">{title}</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
        </div>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
          {cards.length}
          {extraCount ? ` (+${extraCount})` : ""} kort
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <TalentCard key={c.name} data={c} />
        ))}
        {extraCount ? (
          <button className="flex items-center justify-center rounded-md border border-dashed border-border bg-transparent px-4 py-6 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
            Vis +{extraCount} til
            <ChevronRight size={16} strokeWidth={1.5} className="ml-1" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

function TalentCard({ data }: { data: TalentCardData }) {
  const stripeClass =
    data.flag === "promo"
      ? "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-accent"
      : data.flag === "risiko"
        ? "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-destructive"
        : "";
  return (
    <article
      className={`group relative overflow-hidden rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md ${stripeClass}`}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label="Drag-handle"
          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-foreground">
          {data.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold leading-snug">{data.name}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {data.age} år · {data.club}
          </p>
        </div>
        <span className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
          {data.hcp}
        </span>
      </div>

      {/* Volume-prikker */}
      <div className="mt-3 flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < data.volume ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          volum 4u
        </span>
      </div>

      {data.flag === "promo" && data.flagText ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-accent/30 px-2 py-1 text-[11px] font-medium text-foreground">
          <TrendingUp size={12} strokeWidth={1.5} />
          {data.flagText}
        </p>
      ) : null}
      {data.flag === "risiko" && data.flagText ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
          <ShieldAlert size={12} strokeWidth={1.5} />
          {data.flagText}
        </p>
      ) : null}

      <footer className="mt-4 flex items-center gap-2">
        <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
          Detalj
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </button>
        <button className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Endre
        </button>
      </footer>

      {data.flag === "risiko" ? (
        <span className="absolute right-3 top-3 inline-flex items-center text-destructive">
          <AlertTriangle size={14} strokeWidth={1.5} />
        </span>
      ) : null}
    </article>
  );
}
