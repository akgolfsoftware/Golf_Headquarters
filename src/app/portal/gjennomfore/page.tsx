/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre hub
 *
 * Pixel-perfect: matcher Dashboard-pattern. Bruker Athletic-komponenter
 * istedenfor HubFrame (V4-debt fjernet).
 */

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarCheck,
  PlayCircle,
  Plus,
  Radio,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticCard } from "@/components/athletic/card";

export const dynamic = "force-dynamic";

type HubItem = {
  href?: string;
  icon: typeof Activity;
  eyebrow: string;
  title: string;
  data: string;
  sub: string;
  cta: string;
};

const HUB_ITEMS: HubItem[] = [
  {
    href: "/portal/planlegge",
    icon: PlayCircle,
    eyebrow: "01 · NÅVÆRENDE",
    title: "I dag",
    data: "Ingen økter planlagt",
    sub: "Bygg en plan i Planlegge-fanen for å se dagens program her.",
    cta: "Til Planlegge",
  },
  {
    href: "/portal/kalender",
    icon: Calendar,
    eyebrow: "02 · UKA",
    title: "Kalender",
    data: "Ingen økter denne uka",
    sub: "Når coachen din legger inn økter, vises de her.",
    cta: "Åpne kalender",
  },
  {
    icon: Activity,
    eyebrow: "03 · SANNTID",
    title: "Live-økt",
    data: "Live-økter kommer i juni",
    sub: "Start fra fullscreen-modus når funksjonen er live.",
    cta: "Mer info",
  },
  {
    href: "/portal/booking",
    icon: CalendarCheck,
    eyebrow: "04 · COACH",
    title: "Booking",
    data: "Ingen aktive bookinger",
    sub: "Book Pro-time, Trackman eller gruppeøkt.",
    cta: "Book time",
  },
  {
    href: "/portal/mal/trackman",
    icon: Radio,
    eyebrow: "05 · UTSTYR",
    title: "TrackMan",
    data: "Ingen sesjoner enda",
    sub: "Importer fra TrackMan eller logg en ny sesjon.",
    cta: "Logg sesjon",
  },
];

export default async function GjennomforePage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · GJENNOMFØRE</AthleticEyebrow>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Gjør <em className="font-normal italic text-primary">jobben</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Dagens program, kalender, live-økt og bookinger.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/kalender"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <Calendar size={14} strokeWidth={1.75} aria-hidden />
            Kalender
          </Link>
          <Link
            href="/portal/ny-okt"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-6 text-sm font-bold text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105"
          >
            <Plus size={14} strokeWidth={2} aria-hidden />
            Ny økt
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-border py-4 font-mono text-[12px] text-muted-foreground">
        <span>
          <strong className="text-foreground tabular-nums">0</strong> økter i dag
        </span>
        <span className="text-border">·</span>
        <span>
          <strong className="text-foreground tabular-nums">0</strong> denne uka
        </span>
        <span className="text-border">·</span>
        <span>
          <strong className="text-foreground tabular-nums">0</strong> kommende
          bookinger
        </span>
      </div>

      {/* Hub-cards */}
      <section
        aria-label="Verktøy"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          const inner = (
            <AthleticCard className="h-full transition-colors hover:border-primary/50">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-foreground">
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
