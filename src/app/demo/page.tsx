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
    url: "/plan-bygger-demo",
    title: "CoachHQ — Plan-bygger (steg 4)",
    source: "coachhq-A/02-plan-bygger.html",
    description:
      "6-step wizard. Naviger til /1, /2, /3, /4, /5, /6 for hvert steg (Player-pick → Periode → Faser → Allokering → Ukentlig → Confirm)",
    status: "ferdig",
  },
  {
    url: "/daglig-brief-demo",
    title: "CoachHQ — Daglig brief",
    source: "01-daglig-brief-default.html",
    description: "Morgenrapport for coach med dagens fokus og prioriteringer",
    status: "ferdig",
  },
  {
    url: "/kalender-demo",
    title: "CoachHQ — Kalender (uke)",
    source: "01-kalender-uke.html",
    description: "Uke-kalender med 7 kolonner og time-blokker",
    status: "ferdig",
  },
  {
    url: "/baner-demo",
    title: "PlayerHQ — Baner",
    source: "playerhq-A/01-baner.html",
    description:
      "Norge-kart med 14 pins + 6 bane-cards (spilte + anbefalte). Tier-gating: Pro for AI-anbefaling",
    status: "ferdig",
  },
  {
    url: "/mal-detalj-demo",
    title: "PlayerHQ — Mål-detalj (HCP)",
    source: "playerhq-A/02-mal-detalj.html",
    description:
      "HCP-mål til scratch. Projeksjonsgraf NOV–DES, 5 delmål, siste 6 runder, Pro-låst innsikt",
    status: "ferdig",
  },
  {
    url: "/leaderboard-demo",
    title: "PlayerHQ — Leaderboard",
    source: "playerhq-A/03-mal-leaderboard.html",
    description: "Venner/Klubb/Globalt-tabs (Globalt Pro-låst). 12 spillere, badges, Markus #7",
    status: "ferdig",
  },
  {
    url: "/test-detalj-demo",
    title: "PlayerHQ — Test-detalj",
    source: "playerhq-A/04-test-detalj.html",
    description: "Bunker u&d. Trend-graf, attempts-tabell, sticky drawer med protokoll",
    status: "ferdig",
  },
  {
    url: "/trackman-demo",
    title: "PlayerHQ — TrackMan-analyse",
    source: "playerhq-A/05-trackman.html",
    description: "Pro-only. 8 køller, trajectory-SVG, dispersion-pattern, compare-bars",
    status: "ferdig",
  },
  {
    url: "/ny-okt-demo/1",
    title: "PlayerHQ — Ny økt-wizard (6 steg)",
    source: "playerhq-C/01-06-ny-okt-steg-*.html",
    description:
      "6-step wizard for å logge ny økt: Type → Varighet → Fasilitet → Tid → Øvelser → Sammendrag. Naviger /1 til /6",
    status: "ferdig",
  },
  {
    url: "/onskeligokt-demo",
    title: "PlayerHQ — Ønsket økt",
    source: "playerhq-C/07-onskeligokt.html",
    description: "Be coach om økt: type, tema, tid (2 alternativer), fasilitet, melding",
    status: "ferdig",
  },
  {
    url: "/coach-melding-demo",
    title: "PlayerHQ — Coach-melding (compose)",
    source: "playerhq-C/08-coach-melding.html",
    description: "Skriv melding til coach med vedlegg (video, TrackMan-PNG) og plan-link",
    status: "ferdig",
  },
  {
    url: "/tren-kalender-demo",
    title: "PlayerHQ — Tren-kalender (uke)",
    source: "playerhq-C/09-tren-kalender.html",
    description:
      "Spillerens egen kalender med 4 KPI, 7-dagers grid, ukentlig pyramide-donut, streak og form-topp",
    status: "ferdig",
  },
  {
    url: "/treningsdetalj-demo",
    title: "PlayerHQ — Trening-detalj (post-økt)",
    source: "playerhq-C/10-treningsdetalj.html",
    description:
      "Post-økt detalj: 4 sum-cards, pyramide-bidrag, coach-notat, 5 økt-blokker, opplevd intensitet",
    status: "ferdig",
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
