import Link from "next/link";
import {
  Home,
  Calendar,
  Target,
  Users,
  BookOpen,
  ArrowRight,
  Layers,
} from "lucide-react";

type SampleCard = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
};

const SAMPLES: SampleCard[] = [
  {
    href: "/v2-preview/portal",
    eyebrow: "PLAYERHQ · HJEM",
    title: "Arbeidsbenk",
    description:
      "Full hjem-side for spiller med LiveBar, PhotoHero, ItineraryList, InsightCard, PyramidBar, StatTile, QuickAction, TournamentCard og WellnessCard.",
    icon: <Home size={24} strokeWidth={1.75} />,
    tag: "Sample 1",
  },
  {
    href: "/v2-preview/portal/kalender",
    eyebrow: "PLAYERHQ · PROGRAM",
    title: "Uke-agenda",
    description:
      "Fullstendig ukevisning med ItineraryList gruppert per dag, PageHero og SectionHeader for uke 21.",
    icon: <Calendar size={24} strokeWidth={1.75} />,
    tag: "Sample 2",
  },
  {
    href: "/v2-preview/portal/mal",
    eyebrow: "PLAYERHQ · MÅL",
    title: "Mål-hub",
    description:
      "GoalsHubPattern med 5 mål + TimelinePattern med 5 siste milepæler. Viser akseprogress og deadlines.",
    icon: <Target size={24} strokeWidth={1.75} />,
    tag: "Sample 3",
  },
  {
    href: "/v2-preview/admin",
    eyebrow: "COACHHQ · HJEM",
    title: "AgencyOS",
    description:
      "Coach-hjem med PhotoHero (coach-variant), StatTile-rad, InsightCard x3 og AuditLogPattern for siste 5 hendelser.",
    icon: <BookOpen size={24} strokeWidth={1.75} />,
    tag: "Sample 4",
  },
  {
    href: "/v2-preview/admin/spillere",
    eyebrow: "COACHHQ · STALL",
    title: "Spiller-oversikt",
    description:
      "Grid med spiller-kort (avatar, navn, HCP, tier-pill, siste økt), filter-bar og paginering-stub.",
    icon: <Users size={24} strokeWidth={1.75} />,
    tag: "Sample 5",
  },
];

export default function V2PreviewIndex() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Top banner */}
      <div
        className="border-b border-border px-8 py-4 flex items-center gap-4"
        style={{
          background:
            "color-mix(in oklab, var(--foreground) 3%, transparent)",
        }}
      >
        <Layers size={16} className="text-muted-foreground" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          V2 PREVIEW · ANDERS REVIEW
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          25. mai 2026
        </span>
      </div>

      {/* Hero */}
      <div
        className="px-8 py-12 border-b border-border"
        style={{ maxWidth: 1280, margin: "0 auto" }}
      >
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--primary)" }}
        >
          V2 PREVIEW · ANDERS REVIEW
        </span>
        <h1
          className="m-0 mt-4 font-display font-bold tracking-[-0.03em] leading-[0.95] text-foreground"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          Sample-skjermer for{" "}
          <span style={{ fontStyle: "italic", color: "var(--accent-foreground)" }}>
            V2-bibliotek
          </span>
        </h1>
        <p className="mt-4 mb-0 text-[16px] text-muted-foreground max-w-[56ch]">
          5 referanse-implementasjoner som beviser at det nye
          designsystem-biblioteket fungerer på ekte sider. Klikk deg inn på
          hver skjerm og vurder pixel-presisjon, komponent-samspill og
          responsivitet.
        </p>
      </div>

      {/* Grid */}
      <div
        className="px-8 py-10"
        style={{ maxWidth: 1280, margin: "0 auto" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-4 p-6 rounded-[20px] border border-border no-underline transition-all duration-[160ms]"
              style={{
                background: "var(--card)",
                color: "inherit",
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className="w-12 h-12 rounded-[12px] grid place-items-center flex-shrink-0"
                  style={{
                    background:
                      "color-mix(in oklab, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {s.icon}
                </span>
                <span
                  className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full px-[10px] py-[5px]"
                  style={{
                    background: "var(--foreground)",
                    color: "var(--background)",
                  }}
                >
                  {s.tag}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {s.eyebrow}
                </span>
                <h2
                  className="m-0 font-display font-bold tracking-[-0.02em] text-foreground"
                  style={{ fontSize: 22 }}
                >
                  {s.title}
                </h2>
                <p className="m-0 text-[13px] text-muted-foreground leading-[1.55]">
                  {s.description}
                </p>
              </div>

              {/* CTA */}
              <span className="mt-auto inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground">
                Åpne skjerm <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em]">
            Designsystem-dokumentasjon
          </span>
          <Link
            href="/design-system-v2"
            className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground no-underline"
          >
            Se V2 Design System <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
