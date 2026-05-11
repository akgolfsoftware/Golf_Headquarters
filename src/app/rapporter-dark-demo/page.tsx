/**
 * PILOT — CoachHQ Rapporter
 * Bygd fra wireframe/design-files-v2/05-rapporter-dark.html
 * URL: /rapporter-dark-demo
 */
import {
  BarChart3,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  History,
  LayoutGrid,
  LineChart,
  Plus,
  Search,
  TrendingUp,
  Zap,
  Home,
  Bot,
} from "lucide-react";

type Tone = "default" | "accent" | "gold" | "danger" | "turn";

type ReportTemplate = {
  title: string;
  desc: string;
  meta: string[];
  icon: React.ReactNode;
  tone: Tone;
  featured?: boolean;
};

const PARENT_REPORTS: ReportTemplate[] = [
  {
    title: "Månedsrapport spiller",
    desc: "Per-spiller oppsummering med pyramide-fordeling, HCP-trend, oppmøte og kommentarer fra coach. Sendes til foresatte.",
    meta: ["PDF", "3 sider", "~28 sek"],
    icon: <FileText className="h-5 w-5" />,
    tone: "accent",
    featured: true,
  },
  {
    title: "Kvartalsrapport spiller",
    desc: "3-måneders sammenstilling med statistikk, milepæler og turneringsresultater for foreldre-samtaler.",
    meta: ["PDF", "6 sider", "~42 sek"],
    icon: <LayoutGrid className="h-5 w-5" />,
    tone: "default",
  },
  {
    title: "Sesongoppsummering",
    desc: "Hel-sesong oversikt levert i november med fokus på utvikling, neste sesongs plan og budsjett.",
    meta: ["PDF", "12 sider", "~1 m 14 s"],
    icon: <Clock className="h-5 w-5" />,
    tone: "default",
  },
];

const PLAYER_REPORTS: ReportTemplate[] = [
  {
    title: "Min progresjon",
    desc: "Egen progresjonsrapport som spilleren selv kan laste ned · HCP, SG-tot, pyramide-balanse.",
    meta: ["PDF", "4 sider", "~22 sek"],
    icon: <BarChart3 className="h-5 w-5" />,
    tone: "turn",
  },
  {
    title: "Test-historikk",
    desc: "Alle NGF-tester, Trackman-økter og fysiske tester per spiller med trendgraf.",
    meta: ["PDF · CSV", "5 sider", "~30 sek"],
    icon: <LineChart className="h-5 w-5" />,
    tone: "turn",
  },
];

const BOARD_REPORTS: ReportTemplate[] = [
  {
    title: "Måned-finance",
    desc: "Inntekt per tjeneste, fasilitet-belegg, utestående fordringer og månedlig P&L.",
    meta: ["PDF · Excel", "8 sider", "~38 sek"],
    icon: <DollarSign className="h-5 w-5" />,
    tone: "gold",
  },
  {
    title: "Kvartal-strategisk",
    desc: "Sammenstilling av sportslige mål, drift, økonomi og prognoser for kvartalsstyremøte.",
    meta: ["PDF", "14 sider", "~52 sek"],
    icon: <Zap className="h-5 w-5" />,
    tone: "gold",
  },
  {
    title: "Årsrapport",
    desc: "Hel-års gjennomgang med revisor-vennlig vedlegg. Genereres januar for forrige år.",
    meta: ["PDF", "28 sider", "~2 m 04 s"],
    icon: <TrendingUp className="h-5 w-5" />,
    tone: "gold",
  },
];

const COACH_REPORTS: ReportTemplate[] = [
  {
    title: "Agent-effektivitet",
    desc: "Godkjennings-rate per agent, snitt-respons, false-positives og estimert tidsbesparelse.",
    meta: ["PDF · CSV", "5 sider", "~24 sek"],
    icon: <Bot className="h-5 w-5" />,
    tone: "default",
  },
  {
    title: "Plan-godkjennings-rate",
    desc: "Hvor raskt og hvilke planer godkjennes/avslås. Brukes til å forbedre periodiserings-malene.",
    meta: ["PDF", "4 sider", "~18 sek"],
    icon: <CheckSquare className="h-5 w-5" />,
    tone: "default",
  },
];

const CLUB_REPORTS: ReportTemplate[] = [
  {
    title: "Belegg-rapport",
    desc: "Per fasilitet og per klubb · time-for-time belegg, snitt og peak-vinduer.",
    meta: ["PDF · CSV", "7 sider", "~34 sek"],
    icon: <Home className="h-5 w-5" />,
    tone: "danger",
  },
  {
    title: "Inntekt-per-tjeneste",
    desc: "Coaching · simulator · gruppe · range. Brytes ned per måned og klubb.",
    meta: ["PDF · Excel", "6 sider", "~30 sek"],
    icon: <DollarSign className="h-5 w-5" />,
    tone: "danger",
  },
];

const SCHEDULED = [
  {
    name: "Månedsrapport — alle foreldre",
    recipients: "38 mottakere · A4-gruppen + foresatte",
    when: "Hver 1. kl 08:00",
    next: "Neste: 1. juni",
  },
  {
    name: "Kvartal-finance — styret",
    recipients: "5 mottakere · styre@akgolf.no",
    when: "Hver 1. apr/jul/okt/jan",
    next: "Neste: 1. juli",
  },
  {
    name: "Belegg-rapport — Mulligan",
    recipients: "2 mottakere · drift@mulligan.no",
    when: "Hver mandag kl 09:00",
    next: "Neste: 18. mai",
  },
  {
    name: "Agent-effektivitet",
    recipients: "1 mottaker · anders@akgolf.no",
    when: "Hver 1. mandag kl 07:00",
    next: "Neste: 1. juni",
  },
];

export default function RapporterDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              CoachHQ · Mal-katalog
            </div>
            <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-tight">
              <em className="font-normal italic">Hva trenger du å rapportere?</em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              12 maler tilgjengelig · 4 planlagte leveranser · neste 1. juni kl 08:00
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <History className="h-4 w-4" />
              Historikk
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" />
              Planlegg ny
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Kpi label="Maler tilgjengelig" value="12" foot="i 5 kategorier" />
          <Kpi label="Generert · 30 d" value="47" delta="+8" deltaTone="up" foot="vs forrige måned" />
          <Kpi label="Planlagte leveranser" value="4" foot="neste: 1. juni kl 08:00" />
          <Kpi
            label="Snitt-genereringstid"
            value="28"
            unit=" s"
            foot="raskest 6 s · tregest 1 m 14 s"
          />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Søk rapport-mal</span>
          </div>
          {[
            { label: "Alle kategorier", active: true },
            { label: "For foreldre (3)" },
            { label: "For spillere (2)" },
            { label: "For styret (3)" },
            { label: "For coaches (2)" },
            { label: "For klubber (2)" },
          ].map((c) => (
            <Chip key={c.label} active={c.active}>
              {c.label}
            </Chip>
          ))}
          <span className="h-5 w-px bg-border" />
          <Chip>Sortert: Mest brukt</Chip>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_320px] gap-8 items-start">
          <div>
            <CategoryHeader title="For foreldre" count={3} />
            <ReportGrid reports={PARENT_REPORTS} />

            <CategoryHeader title="For spillere" count={2} />
            <ReportGrid reports={PLAYER_REPORTS} />

            <CategoryHeader title="For styret" count={3} />
            <ReportGrid reports={BOARD_REPORTS} />

            <CategoryHeader title="For coaches" count={2} />
            <ReportGrid reports={COACH_REPORTS} />

            <CategoryHeader title="For klubber" count={2} />
            <ReportGrid reports={CLUB_REPORTS} />
          </div>

          {/* Right rail */}
          <aside className="sticky top-6 overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
              <h3 className="font-display text-[14px] font-semibold tracking-tight">
                Planlagte leveranser
              </h3>
              <span className="font-mono text-[12px] text-muted-foreground">
                4 aktive
              </span>
            </div>
            {SCHEDULED.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b border-border px-5 py-3.5 last:border-b-0"
              >
                <div className="text-[13.5px] font-medium leading-[1.4] text-foreground">
                  {s.name}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {s.recipients}
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
                  <span>{s.when}</span>
                  <span>·</span>
                  <span className="font-semibold text-primary">{s.next}</span>
                </div>
                <div className="mt-1.5 flex gap-2">
                  <button className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                    Pause
                  </button>
                  <button className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                    Endre
                  </button>
                  <button className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                    Slett
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-border px-5 py-4">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Plus className="h-4 w-4" />
                Planlegg ny leveranse
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down";
  foot: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums">
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              deltaTone === "up"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta}
          </span>
        )}
        <span className="text-muted-foreground">{foot}</span>
      </div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function CategoryHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mt-8 mb-3.5 flex items-center gap-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-muted-foreground first:mt-0">
      <span>{title}</span>
      <span className="font-mono text-[11px] font-medium text-muted-foreground">
        {count} maler
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function ReportGrid({ reports }: { reports: ReportTemplate[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {reports.map((r) => (
        <ReportCard key={r.title} report={r} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportTemplate }) {
  const iconBg: Record<Tone, string> = {
    default: "bg-primary/10 text-primary",
    accent: "bg-accent/30 text-[var(--color-pyr-fys,#005840)]",
    gold: "bg-[#FFF0D6] text-[#B8852A]",
    danger: "bg-destructive/10 text-destructive",
    turn: "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={`relative flex flex-col gap-3.5 rounded-lg border p-6 transition-shadow hover:shadow-md ${
        report.featured
          ? "border-accent/40 bg-accent/10"
          : "border-border bg-card"
      }`}
    >
      {report.featured && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-pyr-fys,#005840)]">
          Mest brukt
        </span>
      )}
      <div
        className={`grid h-10 w-10 place-items-center rounded-md ${iconBg[report.tone]}`}
      >
        {report.icon}
      </div>
      <div>
        <div className="font-display text-[16px] font-semibold tracking-tight text-foreground">
          {report.title}
        </div>
        <div className="mt-2 flex-1 text-[13px] leading-[1.55] text-muted-foreground">
          {report.desc}
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5 font-mono text-[11px] text-muted-foreground">
        {report.meta.map((m, i) => (
          <span key={i}>
            {i > 0 && <span className="mr-2.5 text-muted-foreground">·</span>}
            {m}
          </span>
        ))}
      </div>
      <div className="mt-1 flex items-center gap-2 border-t border-border pt-3.5">
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Generer →
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary">
          Planlegg →
        </button>
        <span className="flex-1" />
        <a href="#" className="text-[12px] font-medium text-primary hover:underline">
          Forhåndsvis
        </a>
      </div>
    </div>
  );
}
