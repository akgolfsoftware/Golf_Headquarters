/**
 * /portal/talent — PlayerHQ Talent hub
 * Pixel-perfect: matcher Dashboard-pattern. Athletic-komponenter, ingen HubFrame.
 */

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Download,
  Map as MapIcon,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticCard } from "@/components/athletic/card";

export const dynamic = "force-dynamic";

type HubItem = {
  href?: string;
  icon: typeof Compass;
  eyebrow: string;
  title: string;
  data: string;
  sub: string;
  cta: string;
  featured?: boolean;
};

const HUB_ITEMS: HubItem[] = [
  {
    href: "/portal/talent/mitt-niva",
    icon: Compass,
    eyebrow: "01 · NÅVÆRENDE",
    title: "Mitt nivå",
    data: "Vurdering pågår",
    sub: "Nivå beregnes når du har logget minst 5 runder.",
    cta: "Se vurdering",
  },
  {
    href: "/portal/talent/min-plan",
    icon: Target,
    eyebrow: "02 · UTVIKLING",
    title: "Min plan",
    data: "Ingen aktiv plan",
    sub: "Coach lager en talent-plan med fokus-områder og milepæler.",
    cta: "Åpne plan",
  },
  {
    href: "/portal/talent/roadmap",
    icon: MapIcon,
    eyebrow: "03 · KARRIERE",
    title: "Roadmap",
    data: "12 måneder framover",
    sub: "Visualiser veien fra dagens nivå til ønsket mål.",
    cta: "Se vei",
  },
  {
    href: "/portal/talent/sammenligning",
    icon: Users,
    eyebrow: "04 · BENCHMARK",
    title: "Sammenligning",
    data: "Mot kohort",
    sub: "Hvor står du i din spillerklasse? Krever loggede runder.",
    cta: "Detalj",
  },
  {
    href: "/portal/mal/leaderboard",
    icon: Trophy,
    eyebrow: "05 · RANKING",
    title: "Leaderboard",
    data: "Ingen rangering enda",
    sub: "Du blir rangert etter første loggførte runde.",
    cta: "Se ranking",
  },
  {
    icon: Sparkles,
    eyebrow: "06 · INNSIKT",
    title: "AI-vurdering",
    data: "Anbefalinger kommer",
    sub: "Caddie analyserer SG-data og foreslår fokus-områder.",
    cta: "Mer info",
    featured: true,
  },
  {
    href: "/portal/statistikk",
    icon: TrendingUp,
    eyebrow: "07 · TREND",
    title: "Utvikling siste 90d",
    data: "Ingen trend enda",
    sub: "HCP, SG og runde-snitt over tid — fra første runde.",
    cta: "Se historikk",
  },
];

export default async function TalentPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · TALENT</AthleticEyebrow>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Din vei mot <em className="font-normal italic text-primary">toppen.</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Mitt nivå, karriere-roadmap, sammenligning og leaderboard.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Download size={14} strokeWidth={1.75} aria-hidden />
            Eksporter
          </button>
          <Link
            href="/portal/mal"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-5 text-sm font-bold text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105"
          >
            <Target size={14} strokeWidth={2} aria-hidden />
            Sett mål
          </Link>
        </div>
      </header>

      {/* Pre-BETA banner */}
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-amber-700">
          PRE-BETA · Talent-modulen viser foreløpig demo-data — kobles til DB post-BETA
        </p>
      </div>

      {/* Hub-cards */}
      <section
        aria-label="Talent-verktøy"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          const inner = (
            <AthleticCard
              className={`h-full transition-colors ${
                item.featured
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
            >
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-md ${
                      item.featured
                        ? "bg-accent text-primary"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <AthleticEyebrow>{item.eyebrow}</AthleticEyebrow>
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {item.data}
                  </p>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">
                  {item.sub}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {item.cta}
                  <ArrowRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </div>
            </AthleticCard>
          );

          return item.href ? (
            <Link key={item.title} href={item.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={item.title}>{inner}</div>
          );
        })}
      </section>
    </div>
  );
}
