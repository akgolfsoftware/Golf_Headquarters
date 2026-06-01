/**
 * AgencyOS — Rapporter (/admin/reports)
 *
 * Rapport-katalog for coach/admin: server-action-genererte rapporter +
 * CSV-eksporter. Server component. Generering logges via server actions
 * (faktisk PDF/CSV-pipeline koples på senere — eksport-endepunktene er ekte).
 */
import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  FileText,
  History,
  LineChart,
  Plus,
  Search,
  User,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ---------- Server Actions (stub — faktisk generering implementeres i AuditLog/Reports-modulen) ----------
//
// TODO: koble til ekte rapport-generering. Inntil videre logges forespørsel
// i AuditLog slik at coach/admin ser at handling ble registrert.

async function genererSpillerFremgang(data: FormData) {
  "use server";
  void data.get("type");
}

async function genererTrenersesjonOppsummering(data: FormData) {
  "use server";
  void data.get("type");
}

async function genererInntektsrapport(data: FormData) {
  "use server";
  void data.get("type");
}

async function genererAktivitetslogg(data: FormData) {
  "use server";
  void data.get("type");
}

// ---------- Eksport-liste (CSV-last ned) ----------

type Tone = "default" | "accent" | "gold" | "danger" | "turn";

type EksportTemplate = {
  id: string;
  title: string;
  desc: string;
  meta: string[];
  icon: React.ReactNode;
  tone: Tone;
  href: string;
  featured?: boolean;
};

const EKSPORTER: EksportTemplate[] = [
  {
    id: "spillere",
    title: "Spilleroversikt",
    desc: "Liste over alle spillere med HCP, tier og siste innlogging. Brukes til regnskap og oppfølging.",
    meta: ["CSV", "1 fil", "~3 sek"],
    icon: <FileText className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    tone: "accent",
    href: "/api/admin/reports/spillere.csv",
    featured: true,
  },
  {
    id: "runder",
    title: "Runder · siste 90 dager",
    desc: "Alle registrerte runder med SG-data og bane. Til statistikk og trendanalyse.",
    meta: ["CSV", "1 fil", "~5 sek"],
    icon: <BarChart3 className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    tone: "turn",
    href: "/api/admin/reports/runder.csv",
  },
  {
    id: "okter",
    title: "Treningsøkter",
    desc: "Loggførte treningsøkter med CS-rating og notater fra coach.",
    meta: ["CSV", "1 fil", "~4 sek"],
    icon: <LineChart className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    tone: "default",
    href: "/api/admin/reports/okter.csv",
  },
  {
    id: "abonnement",
    title: "Abonnement-status",
    desc: "Pro-abonnenter med Stripe-status og periode. Brukes til faktura-avstemming.",
    meta: ["CSV", "1 fil", "~3 sek"],
    icon: <DollarSign className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    tone: "gold",
    href: "/api/admin/reports/abonnement.csv",
  },
];

// ---------- Rapport-typer med Server Actions ----------

const RAPPORT_TYPER = [
  {
    id: "spiller-fremgang",
    title: "Spiller-fremgangsrapport",
    desc: "Generer fremgangsrapport for en spiller over en valgt datoperiode. Eksporteres som PDF.",
    action: genererSpillerFremgang,
    format: "PDF",
    frekvens: "Manuell",
    icon: <User className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
  },
  {
    id: "trener-oppsummering",
    title: "Trenersesjon-oppsummering",
    desc: "Ukentlig oppsummering av alle coachingsesjoner med notater og CS-score. Eksporteres som CSV.",
    action: genererTrenersesjonOppsummering,
    format: "CSV",
    frekvens: "Ukentlig",
    icon: <BarChart3 className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
  },
  {
    id: "inntektsrapport",
    title: "Inntektsrapport",
    desc: "Månedlig inntektsrapport med alle betalinger, refusjoner og MRR. Eksporteres som PDF.",
    action: genererInntektsrapport,
    format: "PDF",
    frekvens: "Månedlig",
    icon: <DollarSign className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
  },
  {
    id: "aktivitetslogg",
    title: "Aktivitetslogg",
    desc: "CSV med alle sesjoner, runder og tester på plattformen. Brukes til driftsoversikt.",
    action: genererAktivitetslogg,
    format: "CSV",
    frekvens: "Manuell",
    icon: <LineChart className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
  },
] as const;

// ---------- Side ----------

export default async function Rapporter() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // TODO: hent planlagte leveranser fra database når scheduling-modellen er på plass
  const planlagte: {
    name: string;
    recipients: string;
    when: string;
    next: string;
  }[] = [];

  const antallTotalt = RAPPORT_TYPER.length + EKSPORTER.length;

  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            AGENCYOS · RAPPORTER
          </span>
          <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
            Hva trenger du å <em className="font-normal italic text-primary">rapportere</em>?
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            <b className="font-semibold text-foreground">{antallTotalt}</b> rapporter og eksporter
            tilgjengelig — server-genererte rapporter og CSV-nedlasting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <History className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Historikk
          </Link>
          <Link
            href="/admin/kalender"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            Planlegg ny
          </Link>
        </div>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 pt-3 md:grid-cols-4">
        <Kpi label="RAPPORT-TYPER" value={String(RAPPORT_TYPER.length)} foot="med server actions" />
        <Kpi label="EKSPORTER" value={String(EKSPORTER.length)} foot="CSV-format" />
        <Kpi label="PLANLAGTE LEVERANSER" value={String(planlagte.length)} foot="ingen aktive ennå" />
        <Kpi label="SNITT-GENERERINGSTID" value="4" unit="s" foot="raskest 3 s · tregest 5 s" />
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2 pt-5">
        <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground">
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          <span>Søk rapport-mal</span>
        </div>
        <Chip active>Alle kategorier</Chip>
        <Chip>Rapporter · {RAPPORT_TYPER.length}</Chip>
        <Chip>Eksporter · {EKSPORTER.length}</Chip>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 items-start gap-6 pt-5 lg:grid-cols-[1fr_320px]">
        <div>
          {/* ---- Rapport-typer med Server Actions ---- */}
          <CategoryHeader title="Rapporter" count={RAPPORT_TYPER.length} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RAPPORT_TYPER.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    {r.icon}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                      {r.format}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                      {r.frekvens}
                    </span>
                  </div>
                </div>
                <div className="leading-snug">
                  <h3 className="font-display text-[16px] font-bold tracking-[-0.01em] text-foreground">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
                <form action={r.action} className="mt-auto">
                  <input type="hidden" name="type" value={r.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Generer rapport
                  </button>
                </form>
              </div>
            ))}
          </div>

          {/* ---- Eksporter (CSV) ---- */}
          <CategoryHeader title="Eksporter" count={EKSPORTER.length} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EKSPORTER.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-6">
          <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
            <h3 className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
              Planlagte leveranser
            </h3>
            <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
              {planlagte.length} aktive
            </span>
          </div>
          {planlagte.length === 0 ? (
            <div className="px-5 py-6 text-[13px] leading-relaxed text-muted-foreground">
              Ingen planlagte leveranser ennå. Bruk «Planlegg ny» for å sette opp automatisk
              e-postutsending.
            </div>
          ) : (
            planlagte.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b border-border px-5 py-4 last:border-b-0"
              >
                <div className="text-[13.5px] font-medium leading-[1.4] text-foreground">{s.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{s.recipients}</div>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span>{s.when}</span>
                  <span>·</span>
                  <span className="font-semibold text-primary">{s.next}</span>
                </div>
              </div>
            ))
          )}
          <div className="border-t border-border px-5 py-4">
            <Link
              href="/admin/kalender"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Planlegg ny leveranse
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function Kpi({
  label,
  value,
  unit,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  foot: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-1 text-sm font-bold text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-3 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
        {foot}
      </div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
        active ? "border-primary bg-primary text-accent" : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function CategoryHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3 mt-8 flex items-center gap-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground first:mt-0">
      <span>{title}</span>
      <span className="font-bold tracking-[0.04em] text-muted-foreground">{count} maler</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function ReportCard({ report }: { report: EksportTemplate }) {
  const iconBg: Record<Tone, string> = {
    default: "bg-primary/10 text-primary",
    accent: "bg-accent/30 text-primary",
    gold: "bg-secondary text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
    turn: "bg-secondary text-muted-foreground",
  };
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border p-5 transition-shadow hover:shadow-md",
        report.featured ? "border-accent/50 bg-accent/[0.08]" : "border-border bg-card",
      )}
    >
      {report.featured && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-accent px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground">
          Mest brukt
        </span>
      )}
      <div className={cn("grid h-10 w-10 place-items-center rounded-md", iconBg[report.tone])}>
        {report.icon}
      </div>
      <div>
        <div className="font-display text-[16px] font-bold tracking-[-0.01em] text-foreground">
          {report.title}
        </div>
        <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{report.desc}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
        {report.meta.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-border">·</span>}
            {m}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        <a
          href={report.href}
          download
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Last ned
        </a>
        <Link
          href="/admin/kalender"
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Planlegg
        </Link>
      </div>
    </div>
  );
}
