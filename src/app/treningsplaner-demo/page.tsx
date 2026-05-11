/**
 * CoachHQ — Treningsplaner (kanban)
 * Bygd fra wireframe/design-files-v2/screens/02-treningsplaner.html (produksjons-frame 01)
 * URL: /treningsplaner-demo
 */

import {
  Search,
  Plus,
  Sparkles,
  ChevronDown,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";

type Status = "active" | "paused" | "archived";
type Periode = "default" | "warn" | "danger" | "live";

type Plan = {
  avatar: string;
  avBg: string;
  avFg?: string;
  player: string;
  title: string;
  progress: number;
  periode: string;
  periodeTone: Periode;
  source: "AI" | "Mal" | "Manuell";
  weeks?: string;
  coachInitials: string;
  coachBg: string;
};

type Archived = {
  initials: string;
  bg: string;
  player: string;
  title: string;
  when: string;
};

const activePlans: Plan[] = [
  {
    avatar: "MP",
    avBg: "#005840",
    player: "Markus Roinås Pedersen",
    title: "Sommer-toppform 2026",
    progress: 78,
    periode: "9. mai – 30. jun",
    periodeTone: "default",
    source: "AI",
    weeks: "8 uker",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "ES",
    avBg: "#1A7D56",
    player: "Emma Solberg",
    title: "Putting-fokus, kort sesong",
    progress: 42,
    periode: "2. mai – 14. mai",
    periodeTone: "warn",
    source: "Mal",
    weeks: "2 uker",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "LH",
    avBg: "#D1F843",
    avFg: "#0A1F18",
    player: "Lina Hellesund",
    title: "Eliteoppkjøring NM Junior",
    progress: 54,
    periode: "12. apr – 18. jul",
    periodeTone: "default",
    source: "AI",
    weeks: "14 uker",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "JT",
    avBg: "#A32D2D",
    player: "Joachim Tangen",
    title: "Retur fra skade — fase 2",
    progress: 18,
    periode: "Forfalt 4. mai",
    periodeTone: "danger",
    source: "Manuell",
    weeks: "6 uker",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "JD",
    avBg: "#5E5C57",
    player: "Jon Dahl",
    title: "Konsistens fra tee, midt-sesong",
    progress: 96,
    periode: "Avsluttes 12. mai",
    periodeTone: "live",
    source: "AI",
    weeks: "10 uker",
    coachInitials: "AK",
    coachBg: "#005840",
  },
];

const pausedPlans: Plan[] = [
  {
    avatar: "SK",
    avBg: "#B8852A",
    player: "Sebastian Krohn",
    title: "Vinter-base, off-season",
    progress: 64,
    periode: "Pauset 28. apr",
    periodeTone: "default",
    source: "Manuell",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "NO",
    avBg: "#5EA382",
    player: "Nora Olsen",
    title: "Eksamenstid, redusert volum",
    progress: 38,
    periode: "Pauset 1. mai",
    periodeTone: "default",
    source: "Mal",
    coachInitials: "AK",
    coachBg: "#005840",
  },
  {
    avatar: "VH",
    avBg: "#384c0a",
    avFg: "#D1F843",
    player: "Vegard Hansen",
    title: "Skadeoppfølging, kne",
    progress: 22,
    periode: "Pauset 22. apr",
    periodeTone: "default",
    source: "Manuell",
    coachInitials: "AK",
    coachBg: "#005840",
  },
];

const archived: Archived[] = [
  { initials: "MP", bg: "#005840", player: "Markus R.", title: "Vinter-base 25/26", when: "apr 22" },
  { initials: "ES", bg: "#1A7D56", player: "Emma S.", title: "Putting-fokus mars", when: "apr 14" },
  { initials: "TS", bg: "#B8852A", player: "Tor Stene", title: "Sving-revisjon Q1", when: "apr 2" },
  { initials: "JD", bg: "#5E5C57", player: "Jon Dahl", title: "Pre-sesong base", when: "mar 30" },
  { initials: "LS", bg: "#A32D2D", player: "Lise Sandberg", title: "Skadeprotokoll", when: "mar 18" },
];

export default function TreningsplanerDemo() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach HQ · Treningsplaner
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Tjueire planer i flyt. <em className="italic text-primary">Tre forfaller før helga.</em>
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border bg-card">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
              <List size={14} strokeWidth={1.5} />
              Liste
            </button>
            <button className="inline-flex items-center gap-1.5 border-l border-border bg-foreground px-3 py-2 text-[12px] font-medium text-background">
              <LayoutGrid size={14} strokeWidth={1.5} />
              Kanban
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
            <Sparkles size={14} strokeWidth={1.5} />
            AI-generer
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90">
            <Plus size={14} strokeWidth={1.5} />
            Ny plan
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3.5">
        <KpiFeature
          label="Aktive planer"
          value="24"
          suffix="/ 38 spillere"
          delta="63 % av portefølje aktiv"
        />
        <Kpi label="Snitt-progress" value="64 %" delta="+8 % vs sist mnd" deltaTone="good" />
        <Kpi label="Forfaller denne uka" value="3" delta="Krever oppfølging" deltaTone="warn" />
        <Kpi label="AI-genererte" value="12" delta="50 % av aktive" />
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <span className="flex-1">Søk plan eller spiller</span>
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
        <Chip active>Alle coacher</Chip>
        <Chip>Anders K</Chip>
        <span className="h-5 w-px bg-border" />
        <Chip active>Aktiv nå</Chip>
        <Chip>
          Snart <span className="font-mono text-[10px] font-semibold opacity-70">3</span>
        </Chip>
        <Chip>Forfalt</Chip>
        <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          Sist endret
          <ChevronDown size={12} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          Viser <span className="font-medium text-foreground">29 av 76</span> planer · gruppert
          etter status
        </span>
        <span>
          Sortert: <span className="font-medium text-foreground">Sist endret</span>
        </span>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
        <Column color="var(--color-primary,#005840)" title="Aktiv" count={24}>
          {activePlans.map((p) => (
            <PlanCard key={p.player + p.title} plan={p} />
          ))}
        </Column>

        <Column color="var(--color-muted-foreground,#5E5C57)" title="Pause" count={5} muted>
          {pausedPlans.map((p) => (
            <PlanCard key={p.player + p.title} plan={p} muted />
          ))}
        </Column>

        <Column color="#bcb8ad" title="Arkivert" count={47} collapsed>
          <div className="flex flex-col gap-1.5">
            {archived.map((a) => (
              <div
                key={a.player + a.title}
                className="grid grid-cols-[24px_70px_1fr_auto] items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-[11px]"
              >
                <div
                  className="grid h-6 w-6 place-items-center rounded-full font-mono text-[9px] font-semibold text-white"
                  style={{ background: a.bg }}
                >
                  {a.initials}
                </div>
                <span className="font-medium text-foreground">{a.player}</span>
                <span className="truncate text-muted-foreground">{a.title}</span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {a.when}
                </span>
              </div>
            ))}
            <div className="rounded-md border border-dashed border-border bg-transparent px-2.5 py-2 text-center font-mono text-[10px] text-muted-foreground">
              + 42 eldre planer
            </div>
          </div>
        </Column>
      </div>
    </div>
  );
}

function Column({
  color,
  title,
  count,
  muted,
  collapsed,
  children,
}: {
  color: string;
  title: string;
  count: number;
  muted?: boolean;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-lg border border-border bg-card p-3 ${muted ? "opacity-90" : ""}`}>
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground">
          {title}
        </span>
        <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
          {count}
        </span>
        <button className="ml-auto grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
          {collapsed ? (
            <ChevronDown size={13} strokeWidth={1.5} />
          ) : (
            <Plus size={13} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function PlanCard({ plan, muted }: { plan: Plan; muted?: boolean }) {
  const periodeStyle: Record<Periode, string> = {
    default: "text-muted-foreground",
    warn: "text-[#7d5814]",
    danger: "text-[#A32D2D]",
    live: "text-primary",
  };
  const fillStyle: string =
    plan.progress >= 95
      ? "bg-primary"
      : plan.periodeTone === "danger"
        ? "bg-[#A32D2D]"
        : plan.periodeTone === "warn"
          ? "bg-[#B8852A]"
          : muted
            ? "bg-muted-foreground"
            : "bg-primary";
  return (
    <article className="rounded-md border border-border bg-background p-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold"
          style={{
            background: plan.avBg,
            color: plan.avFg ?? "#FFFFFF",
          }}
        >
          {plan.avatar}
        </div>
        <span className="flex-1 truncate text-[12px] font-medium text-foreground">
          {plan.player}
        </span>
        <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
          <MoreVertical size={13} strokeWidth={1.5} />
        </button>
      </div>
      <h4 className="mb-2.5 font-display text-[14px] font-semibold leading-snug text-foreground">
        {plan.title}
      </h4>
      <div className="mb-2 flex items-center gap-2">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${fillStyle}`}
            style={{ width: `${plan.progress}%` }}
          />
        </div>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {plan.progress} %
        </span>
      </div>
      <div className={`mb-2.5 font-mono text-[10px] tabular-nums ${periodeStyle[plan.periodeTone]}`}>
        {plan.periode}
      </div>
      <div className="flex items-center gap-1.5">
        <SourceTag source={plan.source} />
        {plan.weeks && (
          <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            {plan.weeks}
          </span>
        )}
        <span
          className="ml-auto grid h-6 w-6 place-items-center rounded-full font-mono text-[9px] font-semibold text-white"
          style={{ background: plan.coachBg }}
          title="Coach"
        >
          {plan.coachInitials}
        </span>
      </div>
    </article>
  );
}

function SourceTag({ source }: { source: "AI" | "Mal" | "Manuell" }) {
  if (source === "AI") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-accent/30 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-[#384c0a]">
        <Sparkles size={10} strokeWidth={1.5} />
        AI
      </span>
    );
  }
  if (source === "Mal") {
    return (
      <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-primary">
        Mal
      </span>
    );
  }
  return (
    <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
      Manuell
    </span>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function KpiFeature({
  label,
  value,
  suffix,
  delta,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#1A1916] to-[#2a2823] p-4 text-white">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight">
        {value}
        {suffix && (
          <span className="ml-1.5 font-sans text-[13px] font-normal text-white/55">{suffix}</span>
        )}
      </div>
      <div className="font-mono text-[10px] tracking-[0.02em] text-[#D1F843]">{delta}</div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: "good" | "warn";
}) {
  const tone =
    deltaTone === "good"
      ? "text-[#1A7D56]"
      : deltaTone === "warn"
        ? "text-[#B8852A]"
        : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight text-foreground">
        {value}
      </div>
      <div className={`font-mono text-[10px] tracking-[0.02em] ${tone}`}>{delta}</div>
    </div>
  );
}
