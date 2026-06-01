/**
 * /portal/analysere — PlayerHQ Analysere hub
 *
 * Pixel-perfect: matcher Dashboard-pattern. Athletic-komponenter, ingen HubFrame.
 */

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Download,
  Flag,
  Map as MapIcon,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticCard } from "@/components/athletic/card";
import { hentTreningsanalyse } from "@/lib/portal-analyse/treningsanalyse-data";
import { Treningsanalyse } from "@/components/portal/analyse/treningsanalyse";

export const dynamic = "force-dynamic";

type HubItem = {
  href?: string;
  icon: typeof BarChart3;
  eyebrow: string;
  title: string;
  data: string;
  sub: string;
  cta: string;
  featured?: boolean;
};

const HUB_ITEMS: HubItem[] = [
  {
    href: "/portal/mal/runder/ny",
    icon: Sparkles,
    eyebrow: "KOM I GANG",
    title: "Logg første runde",
    data: "Statistikk og analyser kommer her",
    sub: "Når du har logget dine første runder, ser du SG-fordeling, trender og AI-innsikt. Begynn med å legge til en runde fra Mål-fanen.",
    cta: "Legg til runde",
    featured: true,
  },
  {
    href: "/portal/statistikk",
    icon: BarChart3,
    eyebrow: "01 · OVERSIKT",
    title: "Statistikk",
    data: "0 runder loggført",
    sub: "Snitt, GIR og driver-distanse vises når du har minst 3 runder.",
    cta: "Til statistikk",
  },
  {
    href: "/portal/mal/sg-hub",
    icon: TrendingUp,
    eyebrow: "02 · NØKKELTALL",
    title: "Strokes Gained",
    data: "Ingen data enda",
    sub: "SG-fordeling (Tee · Approach · Around · Putt) krever shot-by-shot-runder.",
    cta: "Lær mer om SG",
  },
  {
    href: "/portal/mal/runder",
    icon: Flag,
    eyebrow: "03 · RUNDER",
    title: "Runder",
    data: "Ingen runder enda",
    sub: "Logg din første runde for å bygge runde-historikken.",
    cta: "Logg runde",
  },
  {
    href: "/portal/mal/trackman",
    icon: Radio,
    eyebrow: "04 · ØVELSE",
    title: "TrackMan",
    data: "Ingen sesjoner enda",
    sub: "Importer fra TrackMan eller logg en ny range-sesjon.",
    cta: "Importer",
  },
  {
    href: "/portal/tren/tester",
    icon: ClipboardCheck,
    eyebrow: "05 · MÅLINGER",
    title: "Tester",
    data: "Ingen test-resultater enda",
    sub: "Test-batteriet (CMJ, Squat, Wedge 50m, 5-iron carry) starter når coach tildeler tester.",
    cta: "Se tester",
  },
  {
    icon: Sparkles,
    eyebrow: "06 · AI-CADDIE",
    title: "AI-innsikt",
    data: "Anbefalinger kommer",
    sub: "Caddie analyserer SG-data og foreslår fokus-områder etter første runde.",
    cta: "Mer info",
  },
  {
    href: "/portal/mal/baner",
    icon: MapIcon,
    eyebrow: "07 · GEOGRAFI",
    title: "Baner",
    data: "Ingen baner spilt",
    sub: "Når du logger runder, bygger vi geografisk oversikt over banene dine.",
    cta: "Utforsk baner",
  },
  {
    href: "/portal/mal/leaderboard",
    icon: Trophy,
    eyebrow: "08 · POSISJON",
    title: "Leaderboard",
    data: "Ingen rangering enda",
    sub: "Du blir rangert i din spillerklasse etter første loggførte runde.",
    cta: "Se leaderboard",
  },
];

export default async function AnaylsererPage() {
  const user = await requirePortalUser();
  const treningsanalyse = await hentTreningsanalyse(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · ANALYSERE</AthleticEyebrow>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Forstå spillet <em className="font-normal italic text-primary">ditt</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Statistikk, Strokes Gained, runder, TrackMan, tester og AI-innsikt.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Download size={14} strokeWidth={1.75} aria-hidden />
            Eksporter
          </button>
          <Link
            href="/portal/mal/runder/ny"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-6 text-sm font-bold text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105"
          >
            <Plus size={14} strokeWidth={2} aria-hidden />
            Logg runde
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-border py-4 font-mono text-[12px] text-muted-foreground">
        <span>
          <strong className="text-foreground tabular-nums">0</strong> runder
        </span>
        <span className="text-border">·</span>
        <span>
          <strong className="text-foreground tabular-nums">0</strong> tester
        </span>
        <span className="text-border">·</span>
        <span>
          <strong className="text-foreground tabular-nums">0</strong> TrackMan-sesjoner
        </span>
      </div>

      {/* Treningsanalyse — dekomponer treningen, koble tid mot SG */}
      <div className="mx-auto w-full max-w-[480px] lg:max-w-[640px]">
        <Treningsanalyse data={treningsanalyse} />
      </div>

      {/* Hub-cards */}
      <section
        aria-label="Analyse-verktøy"
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
