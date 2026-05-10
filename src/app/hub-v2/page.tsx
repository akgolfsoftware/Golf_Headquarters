import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coins,
  Dumbbell,
  FileText,
  Inbox,
  Layers,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * PILOT — CoachHQ Hub fra design-pakken (01-coachhq-hub.md)
 * Bygd direkte fra design-spec uten å gå via claude.ai/design.
 *
 * Sammenligning:
 *   /admin       → eksisterende Sprint 0-versjon
 *   /admin/hub-v2 → denne piloten (design-system v2 + design-pakke spec)
 */

const COACH_RAIL_ITEMS = [
  { icon: LayoutGrid, label: "Hub", active: true },
  { icon: Users, label: "Spillere" },
  { icon: Calendar, label: "Kalender" },
  { icon: ClipboardList, label: "Plans" },
  { icon: Settings, label: "Innstillinger" },
];

const COACH_NAV_ITEMS: { label: string; group: "I dag" | "Planlegg" | "Folg opp" | "Drift" }[] = [
  { label: "Hub", group: "I dag" },
  { label: "Daglig brief", group: "I dag" },
  { label: "Treningsplaner", group: "Planlegg" },
  { label: "Plan-maler", group: "Planlegg" },
  { label: "Kalender", group: "Planlegg" },
  { label: "Elever", group: "Folg opp" },
  { label: "Coaching board", group: "Folg opp" },
  { label: "Godkjenninger", group: "Folg opp" },
  { label: "Bookinger", group: "Drift" },
  { label: "Tjenester", group: "Drift" },
  { label: "Okonomi", group: "Drift" },
  { label: "Fasiliteter", group: "Drift" },
];

type Kpi = { label: string; value: string; sub: string; trend?: "up" | "down" };

const KPIS: Kpi[] = [
  { label: "Aktive spillere", value: "32 / 38", sub: "+2 siste 30 dager", trend: "up" },
  { label: "Snitt SG-trend", value: "+0,3", sub: "vs forrige periode", trend: "up" },
  { label: "Belegg neste 7d", value: "78 %", sub: "av tilgjengelig tid", trend: "up" },
  { label: "Inntekt MTD", value: "142 800 kr", sub: "+12 % mot april", trend: "up" },
];

type BentoCard = {
  label: string;
  title: string;
  body: string;
  pill: { text: string; tone: "warning" | "danger" | "info" | "muted" };
  icon: LucideIcon;
  span?: 1 | 2;
};

const BENTO: BentoCard[] = [
  {
    label: "Godkjenninger",
    title: "3 plan-aksjoner",
    body: "Foreslatt av plan-watcher kl 06:00 i dag. Mandag-batch.",
    pill: { text: "Trenger handling", tone: "warning" },
    icon: Sparkles,
    span: 2,
  },
  {
    label: "Uleste meldinger",
    title: "5 fra spillere",
    body: "Markus R. - Emma S. - Joachim T. - 2 fra foresatte",
    pill: { text: "2 over SLA", tone: "danger" },
    icon: MessageSquare,
  },
  {
    label: "Spillere uten plan",
    title: "4 av 38",
    body: "Nye fra forrige uke - trenger periodisering.",
    pill: { text: "Plan-builder", tone: "info" },
    icon: Users,
  },
  {
    label: "Tester forfaller",
    title: "7 denne uka",
    body: "NGF-batch - 4 spillere har levert - 3 igjen.",
    pill: { text: "Paaminn", tone: "muted" },
    icon: ClipboardList,
  },
  {
    label: "Utestaaende faktura",
    title: "3 200 kr",
    body: "2 spillere - 14 og 21 dager forsinket.",
    pill: { text: "Folg opp", tone: "warning" },
    icon: Coins,
  },
  {
    label: "Tournament-watch",
    title: "Sorlandsapent - 12 dager",
    body: "5 spillere paameldt - taper-fase aktiv for 3.",
    pill: { text: "Logistikk", tone: "info" },
    icon: Trophy,
  },
];

type Activity = {
  time: string;
  title: string;
  detail: string;
  status: { text: string; tone: "info" | "success" | "danger" | "muted" };
  icon: LucideIcon;
};

const ACTIVITY: Activity[] = [
  {
    time: "09:42",
    title: "Plan-watcher fant 3 aksjoner",
    detail: "Mandag-batch klar for godkjenning",
    status: { text: "Ny", tone: "info" },
    icon: Sparkles,
  },
  {
    time: "09:15",
    title: "Joachim T. fullforte putte-okt",
    detail: "70 % treff fra 5m, +0,4 SG putt",
    status: { text: "Bekreftet", tone: "success" },
    icon: CheckCircle2,
  },
  {
    time: "08:58",
    title: "Markus R. ber om plan-endring",
    detail: "Onsker mer fokus paa innspill 100-150m",
    status: { text: "SLA: 2t igjen", tone: "danger" },
    icon: MessageSquare,
  },
  {
    time: "07:30",
    title: "Booking bekreftet",
    detail: "Anna K. - Lordag 12. mai 09:00, Mulligan",
    status: { text: "Bekreftet", tone: "success" },
    icon: Calendar,
  },
  {
    time: "06:00",
    title: "Faktura sendt",
    detail: "Lise S. - 1 600 kr - forfall 25. mai",
    status: { text: "Sendt", tone: "muted" },
    icon: FileText,
  },
];

export default function CoachHubV2() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* TO-LAGS sidebar: smal mork rail + lys nav-kolonne */}
      <aside className="flex w-14 shrink-0 flex-col items-center gap-2 bg-[#061210] py-4">
        {COACH_RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              className={`grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                item.active
                  ? "bg-white/10 text-accent"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          );
        })}
        <div className="mt-auto grid h-10 w-10 place-items-center rounded-lg bg-accent/20 font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-accent">
          AK
        </div>
      </aside>

      <aside className="hidden w-[200px] shrink-0 flex-col gap-6 bg-[#FAFAF7] px-3 py-6 md:flex">
        <div className="px-3 font-display text-base font-bold leading-tight tracking-tight text-foreground">
          Coach HQ
        </div>
        <nav className="flex flex-col gap-4">
          {(["I dag", "Planlegg", "Folg opp", "Drift"] as const).map((group) => (
            <div key={group}>
              <div className="px-3 pb-1 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                {group}
              </div>
              <ul className="flex flex-col gap-0.5">
                {COACH_NAV_ITEMS.filter((n) => n.group === group).map((n) => {
                  const active = n.label === "Hub";
                  return (
                    <li key={n.label}>
                      <a
                        href="#"
                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-[rgba(209,248,67,0.30)] font-semibold text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {n.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Hero - editorial italic, IKKE "God morgen, Anders" */}
        <header className="flex flex-col gap-6 px-8 py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Onsdag 11. mai - uke 19 - 09:42
              </span>
              <h1 className="mt-3 font-display text-4xl font-normal italic leading-tight tracking-[-0.02em] text-foreground">
                Onsdag morgen. 38 spillere venter.
              </h1>
              <p className="mt-2 max-w-xl text-base text-muted-foreground">
                7 nye signaler i natt - 3 plan-justeringer venter godkjenning - neste booking om 1t 18min.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                aria-label="Varsler"
              >
                <Bell size={18} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Daglig brief
                <ArrowRight size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        {/* KPI-strip - asymmetrisk: forste kort er bredere */}
        <section className="px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <KpiCard kpi={KPIS[0]} className="sm:col-span-3" emphasized />
            {KPIS.slice(1).map((k) => (
              <KpiCard key={k.label} kpi={k} className="sm:col-span-1" />
            ))}
          </div>
        </section>

        {/* Bento - asymmetrisk grid */}
        <section className="px-8 py-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-[-0.01em]">Modul-snarveier</h2>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Alle moduler
              <ChevronRight size={14} strokeWidth={1.75} className="ml-0.5 inline" />
            </a>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {BENTO.map((card) => (
              <BentoTile key={card.label} card={card} />
            ))}
          </div>
        </section>

        {/* Aktivitets-feed */}
        <section className="px-8 pb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-[-0.01em]">Siste aktivitet</h2>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Se alle
              <ChevronRight size={14} strokeWidth={1.75} className="ml-0.5 inline" />
            </a>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border">
              {ACTIVITY.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {a.time}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-muted-foreground">
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.detail}</div>
                    </div>
                    <StatusPill {...a.status} />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  kpi,
  className = "",
  emphasized = false,
}: {
  kpi: Kpi;
  className?: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20 ${className}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {kpi.label}
      </div>
      <div
        className={`mt-2 font-mono font-medium tabular-nums text-foreground ${
          emphasized ? "text-5xl" : "text-3xl"
        }`}
      >
        {kpi.value}
      </div>
      <div
        className={`mt-1 text-xs ${
          kpi.trend === "up"
            ? "text-[color:var(--status-success,#1A7D56)]"
            : kpi.trend === "down"
              ? "text-destructive"
              : "text-muted-foreground"
        }`}
      >
        {kpi.sub}
      </div>
    </div>
  );
}

function BentoTile({ card }: { card: BentoCard }) {
  const Icon = card.icon;
  const span = card.span === 2 ? "md:col-span-2" : "md:col-span-1";
  return (
    <a
      href="#"
      className={`group flex flex-col rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm ${span}`}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {card.label}
        </span>
        <Icon
          size={18}
          strokeWidth={1.75}
          className="text-muted-foreground transition-colors group-hover:text-primary"
        />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground">
        {card.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-snug text-muted-foreground">{card.body}</p>
      <div className="mt-4">
        <StatusPill text={card.pill.text} tone={card.pill.tone} />
      </div>
    </a>
  );
}

function StatusPill({
  text,
  tone,
}: {
  text: string;
  tone: "info" | "success" | "warning" | "danger" | "muted";
}) {
  const styles: Record<typeof tone, string> = {
    info: "bg-primary/8 text-primary",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    danger: "bg-[#FAE3E3] text-[#A32D2D]",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight ${styles[tone]}`}
    >
      {text}
    </span>
  );
}
