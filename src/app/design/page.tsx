import Link from "next/link";
import { ArrowUpRight, Compass, Layers, Smartphone } from "lucide-react";

export const metadata = {
  title: "Design-galleri — AK Golf HQ",
  description: "Wireframes og visuelle valg for PlayerHQ + CoachHQ",
};

type DesignItem = {
  title: string;
  description: string;
  href: string;
  status?: "BESLUTNING" | "FINAL" | "VARIANT" | "EKSPERIMENT";
};

type DesignSection = {
  title: string;
  intro: string;
  icon: typeof Compass;
  items: DesignItem[];
};

const sections: DesignSection[] = [
  {
    title: "Athletic preview-flater (live data)",
    intro: "Komplette PlayerHQ + CoachHQ-sider med Anders' ekte spillerdata.",
    icon: Smartphone,
    items: [
      {
        title: "PlayerHQ — Hjem",
        description: "Hero, dagens fokus, AI-insikter, pyramide, SG-trend, HCP, distansebånd.",
        href: "/portal-preview",
        status: "FINAL",
      },
      {
        title: "PlayerHQ — Treningsplanlegger",
        description: "Aktiv plan, fremdrift, årsplan-Gantt, periodisering, kalendere, AI-signaler.",
        href: "/portal-preview/planlegger",
        status: "FINAL",
      },
      {
        title: "CoachHQ — Treningsplanlegger",
        description: "Alle aktive planer, godkjenninger, gruppe-fordeling, fokus-spiller, kalendere.",
        href: "/coach-preview/planlegger",
        status: "FINAL",
      },
      {
        title: "Anders som spiller — full data-katalog",
        description: "Alle 14 data-komponenter stablet vertikalt for sammenligning.",
        href: "/design/anders-spiller",
        status: "VARIANT",
      },
    ],
  },
  {
    title: "Komponentkit",
    intro: "Athletic kit og 10 dynamiske kalendere.",
    icon: Layers,
    items: [
      {
        title: "Athletic Kit",
        description: "14 layout/UI-komponenter: Hero, Greeting, KPI, FeaturedCard, etc.",
        href: "/design/athletic-kit",
        status: "FINAL",
      },
      {
        title: "10 dynamiske kalendere",
        description: "Year/Month/Week/Day, Period, Scheduler, Heatmap, Streak, Load, Compare.",
        href: "/design/athletic-kit/kalendere",
        status: "FINAL",
      },
    ],
  },
  {
    title: "Beslutninger som venter",
    intro: "Disse trenger Anders sitt svar i dag.",
    icon: Compass,
    items: [
      {
        title: "Velg designretning",
        description: "3 retninger side-om-side: Editorial Nordic, Pastoral Clubhouse, Athletic Performance.",
        href: "/design/beslutning-retning.html",
        status: "BESLUTNING",
      },
      {
        title: "CoachHQ Hub — 5 stilvarianter",
        description: "Samme hub, 5 ulike stilretninger (opt1 til opt5).",
        href: "/design/coachhq-hub/index.html",
        status: "BESLUTNING",
      },
      {
        title: "Design v3 — index",
        description: "Oversiktsdeck for v3-utforskning av CoachHQ Hub.",
        href: "/design/v3/index.html",
        status: "VARIANT",
      },
    ],
  },
  {
    title: "Final-skjermer (CoachHQ)",
    intro: "Ferdigskissede skjermer klare for kode-implementasjon.",
    icon: Layers,
    items: [
      {
        title: "CoachHQ Hub — final",
        description: "Endelig hub-design som /admin/agencyos skal speile.",
        href: "/design/coachhq-hub-final.html",
        status: "FINAL",
      },
      {
        title: "CoachHQ Kalender — final",
        description: "Endelig kalender-design med dag/uke/måned-toggle.",
        href: "/design/coachhq-kalender-final.html",
        status: "FINAL",
      },
      {
        title: "Performance Athletic — final",
        description: "Athletic-retning for performance-skjermer.",
        href: "/design/performance-athletic.html",
        status: "FINAL",
      },
    ],
  },
  {
    title: "Design v3 — retninger",
    intro: "Tre fulle retninger fra design-files-v3.",
    icon: Smartphone,
    items: [
      {
        title: "01 — Editorial Nordic",
        description: "Magasin-inspirert, Instrument Serif italic, romslig.",
        href: "/design/v3/01-editorial-nordic.html",
        status: "VARIANT",
      },
      {
        title: "02 — Pastoral Clubhouse",
        description: "Varm clubhouse-stemning med natur-toner.",
        href: "/design/v3/02-pastoral-clubhouse.html",
        status: "VARIANT",
      },
      {
        title: "03 — Athletic Performance",
        description: "Dark, sparse lime, premium athletic.",
        href: "/design/v3/03-athletic-performance.html",
        status: "VARIANT",
      },
      {
        title: "Dark variant",
        description: "Dark mode-test av v3-retning.",
        href: "/design/v3/dark.html",
        status: "EKSPERIMENT",
      },
      {
        title: "Light variant",
        description: "Light mode-test av v3-retning.",
        href: "/design/v3/light.html",
        status: "EKSPERIMENT",
      },
    ],
  },
];

const statusClass: Record<NonNullable<DesignItem["status"]>, string> = {
  BESLUTNING: "bg-primary text-primary-foreground",
  FINAL: "bg-accent text-accent-foreground",
  VARIANT: "bg-secondary text-secondary-foreground",
  EKSPERIMENT: "bg-muted text-muted-foreground",
};

export default function DesignGalleryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            AK Golf HQ — Design
          </p>
          <h1 className="font-display mt-2 text-3xl italic leading-tight tracking-tight md:text-4xl">
            Visuelle valg og wireframes
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Alt som krever beslutning eller visning ligger her. Trykk på et kort for å åpne i full størrelse — fungerer på iPhone, iPad og Mac.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-12">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{section.intro}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener"
                      className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold tracking-tight">
                            {item.title}
                          </h3>
                          {item.status ? (
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${statusClass[item.status]}`}
                            >
                              {item.status}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="mt-2 font-mono text-xs text-muted-foreground/80">
                          {item.href}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <footer className="border-t border-border pt-6 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Sist oppdatert 2026-05-18 · akgolf-hq.vercel.app/design
        </footer>
      </main>
    </div>
  );
}
