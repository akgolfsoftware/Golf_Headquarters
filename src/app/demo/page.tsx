import Link from "next/link";

/**
 * Demo-index for piloter konvertert fra Claude Design-bundlen.
 * Bruk dette for å navigere og sammenligne mot HTML-original.
 */

type Pilot = {
  url: string;
  title: string;
  source: string;
  description: string;
  status: "ferdig" | "pågående" | "planlagt";
};

const PILOTS: Pilot[] = [
  {
    url: "/360-demo",
    title: "CoachHQ — 360-profil",
    source: "coachhq-A/01-360-profil.html",
    description:
      "Markus' fulle spillerprofil med hero, pyramide-donut, 4 stat-rich kort og 12-ukers heatmap",
    status: "ferdig",
  },
  {
    url: "/hub-v2",
    title: "CoachHQ — Hub (Sprint 0)",
    source: "Original Sprint 0-pilot",
    description: "Eldre Hub-pilot som ble bygd direkte fra wireframe — ikke fra Claude Design",
    status: "ferdig",
  },
  {
    url: "/plan-bygger-demo",
    title: "CoachHQ — Plan-bygger",
    source: "coachhq-A/02-plan-bygger.html",
    description: "6-step wizard med pyramide-slidere og agent-forslag-banner",
    status: "pågående",
  },
  {
    url: "/daglig-brief-demo",
    title: "CoachHQ — Daglig brief",
    source: "01-daglig-brief-default.html",
    description: "Morgenrapport for coach med dagens fokus og prioriteringer",
    status: "pågående",
  },
  {
    url: "/kalender-demo",
    title: "CoachHQ — Kalender (uke)",
    source: "01-kalender-uke.html",
    description: "Uke-kalender med 7 kolonner og time-blokker",
    status: "pågående",
  },
];

const SOURCE_MAP = {
  ferdig: { tone: "bg-[#E5F1EA] text-[#1A7D56]", label: "Ferdig" },
  pågående: { tone: "bg-[#FFF0D6] text-[#B8852A]", label: "Pågående" },
  planlagt: { tone: "bg-secondary text-muted-foreground", label: "Planlagt" },
} as const;

export default function DemoIndex() {
  const counts = {
    ferdig: PILOTS.filter((p) => p.status === "ferdig").length,
    pågående: PILOTS.filter((p) => p.status === "pågående").length,
    planlagt: PILOTS.filter((p) => p.status === "planlagt").length,
  };

  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)] px-12 py-10">
      <header className="mb-10 max-w-4xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          AK Golf — pilot-implementeringer
        </span>
        <h1 className="mt-2 font-display text-[48px] font-bold leading-tight tracking-[-0.02em]">
          <em className="font-medium italic">Demo-index</em> for Claude Design-piloter
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-muted-foreground">
          React-pages konvertert direkte fra Claude Design HTML-prototyper i{" "}
          <code className="font-mono text-[13px]">wireframe/design-files-v2/</code>.
          Bruker eksisterende design-system v2 tokens (--brand-primary, --color-pyr-*) og hardkodet
          mock-data. Database-binding kommer senere.
        </p>
        <div className="mt-6 flex gap-3">
          <Badge tone="success">{counts.ferdig} ferdig</Badge>
          <Badge tone="warning">{counts.pågående} pågående</Badge>
          {counts.planlagt > 0 && <Badge tone="muted">{counts.planlagt} planlagt</Badge>}
        </div>
      </header>

      <ul className="grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2">
        {PILOTS.map((p) => (
          <li key={p.url}>
            <Link
              href={p.url}
              className="group block rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-[18px] font-semibold leading-snug">{p.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_MAP[p.status].tone}`}
                >
                  {SOURCE_MAP[p.status].label}
                </span>
              </div>
              <code className="mt-1 inline-block font-mono text-[11px] text-muted-foreground">
                {p.source}
              </code>
              <p className="mt-3 text-[13px] leading-[1.5] text-muted-foreground">{p.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-primary group-hover:underline">
                Åpne {p.url} →
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-12 max-w-4xl rounded-lg border border-border bg-card p-5">
        <h4 className="font-display text-[14px] font-semibold">Workflow</h4>
        <ol className="mt-2 list-decimal pl-5 text-[13px] leading-[1.7] text-muted-foreground">
          <li>Anders designer i Claude Design → leverer som tar.gz-bundle</li>
          <li>Bundle ekstraheres til <code className="font-mono text-[11px]">wireframe/design-files-v2/</code></li>
          <li>Claude Code konverterer HTML → React-pages → live på /-demo-URLer</li>
          <li>Når godkjent: hardkodet mock-data byttes til Prisma-henting og siden flyttes inn under <code className="font-mono text-[11px]">src/app/admin/*</code></li>
        </ol>
      </footer>
    </div>
  );
}

function Badge({ tone, children }: { tone: "success" | "warning" | "muted"; children: React.ReactNode }) {
  const styles = {
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    muted: "bg-secondary text-muted-foreground",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}
