import {
  BarChart3,
  DollarSign,
  FileText,
  History,
  LineChart,
  Plus,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type Tone = "default" | "accent" | "gold" | "danger" | "turn";

type ReportTemplate = {
  id: string;
  title: string;
  desc: string;
  meta: string[];
  icon: React.ReactNode;
  tone: Tone;
  href: string;
  featured?: boolean;
};

const EKSPORTER: ReportTemplate[] = [
  {
    id: "spillere",
    title: "Spilleroversikt",
    desc: "Liste over alle spillere med HCP, tier og siste innlogging. Brukes til regnskap og oppfølging.",
    meta: ["CSV", "1 fil", "~3 sek"],
    icon: <FileText className="h-5 w-5" />,
    tone: "accent",
    href: "/api/admin/reports/spillere.csv",
    featured: true,
  },
  {
    id: "runder",
    title: "Runder · siste 90 dager",
    desc: "Alle registrerte runder med SG-data og bane. Til statistikk og trendanalyse.",
    meta: ["CSV", "1 fil", "~5 sek"],
    icon: <BarChart3 className="h-5 w-5" />,
    tone: "turn",
    href: "/api/admin/reports/runder.csv",
  },
  {
    id: "okter",
    title: "Treningsøkter",
    desc: "Loggførte treningsøkter med CS-rating og notater fra coach.",
    meta: ["CSV", "1 fil", "~4 sek"],
    icon: <LineChart className="h-5 w-5" />,
    tone: "default",
    href: "/api/admin/reports/okter.csv",
  },
  {
    id: "abonnement",
    title: "Abonnement-status",
    desc: "Pro-abonnenter med Stripe-status og periode. Brukes til faktura-avstemming.",
    meta: ["CSV", "1 fil", "~3 sek"],
    icon: <DollarSign className="h-5 w-5" />,
    tone: "gold",
    href: "/api/admin/reports/abonnement.csv",
  },
];

export default async function Rapporter() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // TODO: hent planlagte leveranser fra database når scheduling-modellen er på plass
  const planlagte: {
    name: string;
    recipients: string;
    when: string;
    next: string;
  }[] = [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              CoachHQ · Mal-katalog
            </div>
            <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-tight">
              <em className="font-normal italic">Hva trenger du å rapportere?</em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              {EKSPORTER.length} eksporter tilgjengelig · CSV-format for regnskap, analyse og oppfølging
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <History className="h-4 w-4" />
              Historikk
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Planlegg ny
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Kpi label="Maler tilgjengelig" value={String(EKSPORTER.length)} foot="i 1 kategori" />
          <Kpi label="Format" value="CSV" foot="Excel-kompatibel" />
          <Kpi label="Planlagte leveranser" value={String(planlagte.length)} foot="ingen aktive ennå" />
          <Kpi label="Snitt-genereringstid" value="4" unit=" s" foot="raskest 3 s · tregest 5 s" />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Søk rapport-mal</span>
          </div>
          <Chip active>Alle kategorier</Chip>
          <Chip>Eksport ({EKSPORTER.length})</Chip>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_320px] items-start gap-8">
          <div>
            <CategoryHeader title="Eksporter" count={EKSPORTER.length} />
            <ReportGrid reports={EKSPORTER} />
          </div>

          {/* Right rail */}
          <aside className="sticky top-6 overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
              <h3 className="font-display text-[14px] font-semibold tracking-tight">
                Planlagte leveranser
              </h3>
              <span className="font-mono text-[12px] text-muted-foreground">
                {planlagte.length} aktive
              </span>
            </div>
            {planlagte.length === 0 ? (
              <div className="px-5 py-6 text-[13px] text-muted-foreground">
                Ingen planlagte leveranser ennå. Bruk «Planlegg ny» for å sette opp automatisk e-postutsending.
              </div>
            ) : (
              planlagte.map((s, i) => (
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
                </div>
              ))
            )}
            <div className="border-t border-border px-5 py-4">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
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
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  foot: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums">
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
        {foot}
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
    <div className="grid grid-cols-2 gap-4">
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportTemplate }) {
  const iconBg: Record<Tone, string> = {
    default: "bg-primary/10 text-primary",
    accent: "bg-accent/30 text-primary",
    gold: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
    turn: "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={`relative flex flex-col gap-3.5 rounded-lg border p-6 transition-shadow hover:shadow-md ${
        report.featured ? "border-accent/40 bg-accent/10" : "border-border bg-card"
      }`}
    >
      {report.featured && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
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
        <a
          href={report.href}
          download
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Last ned →
        </a>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Planlegg →
        </button>
      </div>
    </div>
  );
}
