import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CircleAlert,
  CircleCheck,
  DollarSign,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAdminHubData } from "@/lib/admin-hub-data";
import { SearchTriggerButton } from "@/components/admin/search-trigger-button";

const ICON_STROKE = 1.75;

type Godkjenning = {
  id: string;
  initials: string;
  bgColor: string;
  title: string;
  source: string;
  severity: "urgent" | "warn" | "info";
  tag: "Urgent" | "Warning" | "Info";
};

type Melding = {
  id: string;
  initials: string;
  bgColor: string;
  name: string;
  time: string;
  muted?: boolean;
};

const godkjenninger: Godkjenning[] = [
  {
    id: "1",
    initials: "JT",
    bgColor: "hsl(var(--destructive))",
    title: "Eskalering — Joachim Tangen, skade-flagg",
    source: "Escalation-agent · for 14 min",
    severity: "urgent",
    tag: "Urgent",
  },
  {
    id: "2",
    initials: "MR",
    bgColor: "hsl(var(--primary))",
    title: "Pauseuke før Sørlandsåpent",
    source: "Deload-agent · for 2t",
    severity: "warn",
    tag: "Warning",
  },
  {
    id: "3",
    initials: "ES",
    bgColor: "var(--color-pyr-tek)",
    title: "TEK-volum: 40 % → 28 %",
    source: "Periodisering · i går 16:42",
    severity: "info",
    tag: "Info",
  },
];

const meldinger: Melding[] = [
  { id: "1", initials: "MR", bgColor: "hsl(var(--primary))", name: "Markus R", time: "07:14" },
  { id: "2", initials: "ES", bgColor: "var(--color-pyr-spill)", name: "Emma S", time: "06:58" },
  { id: "3", initials: "JT", bgColor: "var(--color-pyr-fys)", name: "Joachim T", time: "i går", muted: true },
];

const sevDotClass: Record<Godkjenning["severity"], string> = {
  urgent: "bg-destructive",
  warn: "bg-pyr-spill",
  info: "bg-pyr-tek",
};

const tagClass: Record<Godkjenning["tag"], string> = {
  Urgent: "bg-accent text-accent-foreground",
  Warning: "bg-pyr-spill/15 text-accent-foreground",
  Info: "bg-pyr-tek/15 text-pyr-tek",
};

export default async function AdminHub() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  if (user.role === "GUEST") redirect("/admin/calendar");

  const data = await getAdminHubData(user);

  const idag = new Date();
  const datoFormatert = idag.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dagDel = datoFormatert.charAt(0).toUpperCase() + datoFormatert.slice(1);

  const ukedag = idag.toLocaleDateString("nb-NO", { weekday: "long" });
  const ukedagCap = ukedag.charAt(0).toUpperCase() + ukedag.slice(1);

  const totalSpillere = data.kpi.aktiveSpillere + 6;
  const liveNa = data.dagensTimer.filter(
    (t) => t.startAt.getTime() <= idag.getTime() && t.endAt.getTime() >= idag.getTime(),
  ).length;
  const klokken = idag.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      {/* HERO */}
      <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            <span>Hub</span>
            <span className="text-muted-foreground/60">·</span>
            <span>{dagDel}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-pyr-tek">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pyr-tek opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pyr-tek" />
              </span>
              {liveNa} LIVE NÅ
            </span>
          </div>
          <h1 className="font-display max-w-[780px] text-[36px] font-normal italic leading-[1.05] tracking-[-0.02em] text-foreground md:text-[44px]">
            {ukedagCap} morgen.{" "}
            <span className="not-italic font-semibold text-primary">
              {data.kpi.aktiveSpillere} spillere
            </span>{" "}
            venter.
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>{klokken} · sol over Oslo</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{data.dagensTimer.length} økter i dag</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-semibold text-accent-foreground">
              {data.kpi.ventendeGodkjenninger} godkjenninger venter
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SearchTriggerButton />
          <Link
            href="/admin/calendar"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Ny økt
          </Link>
        </div>
      </header>

      {/* KPI-STRIP */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Featured: aktive spillere */}
        <div className="relative overflow-hidden rounded-2xl border border-transparent bg-[linear-gradient(135deg,#005840_0%,#003B2A_100%)] p-6 text-background shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(209,248,67,0.18)_0%,transparent_70%)]"
          />
          <div className="relative space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-background/65">
              <Users className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Aktive spillere i dag
            </div>
            <div className="font-mono text-[42px] font-medium leading-none tracking-[-0.02em] tabular-nums">
              {data.kpi.aktiveSpillere}
              <span className="ml-2 text-lg text-background/55">/ {totalSpillere}</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-xs text-accent">
              <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
              +4 vs i går
            </div>
            <div className="flex items-center justify-between pt-3 font-mono text-[11px] text-background/55">
              <span>{Math.max(0, totalSpillere - data.kpi.aktiveSpillere)} inaktive</span>
              <div className="flex">
                {[
                  { l: "M", c: "var(--color-pyr-tek)" },
                  { l: "E", c: "#A6651E" },
                  { l: "J", c: "#264E3B" },
                  { l: "L", c: "hsl(var(--destructive))" },
                ].map((a, i) => (
                  <div
                    key={a.l}
                    className="font-display flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground text-[10px] font-semibold text-white"
                    style={{ background: a.c, marginLeft: i === 0 ? 0 : -6 }}
                  >
                    {a.l}
                  </div>
                ))}
                <span className="ml-2 self-center font-mono text-[11px] text-background/55">
                  +{Math.max(0, totalSpillere - data.kpi.aktiveSpillere - 4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Snitt SG-trend */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Snitt SG-trend (30 d)
          </div>
          <div className="font-mono text-[32px] font-medium leading-none tabular-nums text-pyr-tek">
            +0,42
          </div>
          <div className="mt-2">
            <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d="M0,28 L20,30 L40,26 L60,28 L80,22 L100,18 L120,22 L140,16 L160,12 L180,10 L200,6"
                fill="none"
                stroke="var(--color-pyr-tek)"
                strokeWidth="2"
              />
              <path
                d="M0,28 L20,30 L40,26 L60,28 L80,22 L100,18 L120,22 L140,16 L160,12 L180,10 L200,6 L200,40 L0,40 Z"
                fill="var(--color-pyr-tek)"
                opacity="0.12"
              />
              <circle cx="200" cy="6" r="3" fill="var(--color-pyr-tek)" />
            </svg>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[11px] text-muted-foreground">
            <span>30. apr</span>
            <span>13. mai</span>
          </div>
        </div>

        {/* Belegg neste 7 d */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Belegg neste 7 d
          </div>
          <div className="flex items-center gap-4">
            <svg width="64" height="64" viewBox="0 0 36 36" className="shrink-0">
              <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="5"
                strokeDasharray="64.2 87.96"
                transform="rotate(-90 18 18)"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <div className="font-mono text-[32px] font-medium leading-none tabular-nums text-foreground">
                73 %
              </div>
              <div className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-pyr-tek">
                <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                +8 pt
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[11px] text-muted-foreground">
            <span>34 / 47 timer</span>
            <span>13 ledige</span>
          </div>
        </div>

        {/* Inntekt MTD */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Inntekt MTD
          </div>
          <div className="font-mono text-[30px] font-medium leading-none tabular-nums text-foreground">
            182 400
            <span className="ml-1 text-[13px] text-muted-foreground">kr</span>
          </div>
          <div className="inline-flex items-center gap-1 font-mono text-xs text-pyr-tek">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            +12 % vs forrige måned
          </div>
          <div className="mt-auto flex items-center justify-between pt-2 font-mono text-[11px] text-muted-foreground">
            <span>Mai · 13 dager</span>
            <span className="text-pyr-spill">3 200 kr utestående</span>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Godkjenninger */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-[linear-gradient(135deg,#FAFAF7_0%,#F5F2EA_100%)] p-6 shadow-sm dark:bg-card dark:bg-none">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-foreground">
              <Check className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </span>
            Godkjenninger
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 font-mono text-[10px] text-destructive">
              {data.kpi.ventendeGodkjenninger} venter
            </span>
          </div>
          <div className="font-display text-xl font-normal italic leading-tight tracking-[-0.01em] text-foreground">
            Tre plan-aksjoner trenger din godkjenning.
          </div>
          <div className="flex flex-col gap-2">
            {godkjenninger.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${sevDotClass[g.severity]}`} />
                <div
                  className="font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: g.bgColor }}
                >
                  {g.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{g.title}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{g.source}</div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${tagClass[g.tag]}`}
                >
                  {g.tag}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/innboks?tab=godkjennelser"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary"
          >
            Åpne agent-inbox
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          </Link>
        </div>

        {/* Uleste meldinger */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-foreground">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </span>
            Uleste meldinger
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground">
              {Math.max(meldinger.length + 2, data.kpi.ubesvarteMeldinger)} nye
            </span>
          </div>
          <div className="font-display text-[22px] font-normal italic leading-tight tracking-[-0.01em] text-foreground">
            Fem spillere har skrevet siden i går kveld.
          </div>
          <div className="flex flex-col gap-2">
            {meldinger.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-2.5 text-sm ${m.muted ? "opacity-60" : ""}`}
              >
                <div
                  className="font-display flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: m.bgColor }}
                >
                  {m.initials}
                </div>
                <span className="flex-1 font-medium text-foreground">{m.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{m.time}</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/innboks?tab=meldinger"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary"
          >
            Åpne innboks
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          </Link>
        </div>
      </section>

      {/* BUNN-KPI */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Spillere uten plan */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-foreground">
              <CircleAlert className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </span>
            Spillere uten plan
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 font-mono text-[10px] text-destructive">
              4 / {totalSpillere}
            </span>
          </div>
          <div className="font-display text-[26px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            11 %
          </div>
          <div className="text-sm leading-snug text-muted-foreground">
            Lina H, Mads R, Henrik N, Sara V — alle Pro-tier.
          </div>
          <div className="mt-auto flex items-center gap-3 pt-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-pyr-spill" style={{ width: "11%" }} />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              4 av {totalSpillere}
            </span>
          </div>
          <Link
            href="/admin/elever"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary"
          >
            Tildel plan
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          </Link>
        </div>

        {/* Tester forfaller */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-foreground">
              <CircleCheck className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </span>
            Tester forfaller
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground">
              Denne uka
            </span>
          </div>
          <div className="font-display text-[26px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            7 tester
          </div>
          <div className="text-sm leading-snug text-muted-foreground">
            5 SG-baseline, 2 fysiske · gjennomsnitt om 3 dager.
          </div>
          <div className="mt-2 flex gap-1">
            <span className="h-1.5 w-6 rounded-full bg-pyr-tek" />
            <span className="h-1.5 w-6 rounded-full bg-pyr-tek" />
            <span className="h-1.5 w-6 rounded-full bg-pyr-spill" />
            <span className="h-1.5 w-6 rounded-full bg-pyr-spill" />
            <span className="h-1.5 w-6 rounded-full bg-pyr-spill" />
            <span className="h-1.5 w-6 rounded-full bg-destructive" />
            <span className="h-1.5 w-6 rounded-full bg-destructive" />
          </div>
          <Link
            href="/admin/elever"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary"
          >
            Planlegg tester
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          </Link>
        </div>

        {/* Utestående faktura */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-foreground">
              <DollarSign className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </span>
            Utestående faktura
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 font-mono text-[10px] text-destructive">
              3 forfalt
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[24px] font-semibold leading-none tabular-nums text-pyr-spill">
              3 200
            </span>
            <span className="text-xs text-muted-foreground">kr</span>
          </div>
          <div className="text-sm leading-snug text-muted-foreground">
            3 spillere · sist purret 8. mai
          </div>
          <div className="mt-1 flex gap-1.5">
            {[
              { l: "LH", c: "hsl(var(--destructive))" },
              { l: "SV", c: "#A6651E" },
              { l: "HN", c: "#264E3B" },
            ].map((a) => (
              <div
                key={a.l}
                className="font-display flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: a.c }}
              >
                {a.l}
              </div>
            ))}
          </div>
          <Link
            href="/admin/finance"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary"
          >
            Send purring
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          </Link>
        </div>
      </section>
    </div>
  );
}
