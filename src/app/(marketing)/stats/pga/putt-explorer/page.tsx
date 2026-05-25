/**
 * /stats/pga/putt-explorer — interaktiv putt-statistikk per avstand
 *
 * Viser PGA Tour synkeprosent fra 1–20 meter med:
 * - Interaktiv slider: velg avstand, se tour-snitt og topp-10
 * - Bar-chart med alle avstander (Recharts)
 * - Kontekstuell forklaring: "X av 100 missed"
 * - PlayerHQ konverteringsbanner
 *
 * ISR 3600 sekunder (1 time).
 * Data: Broadie-estimater seedet via syncPgaPuttDistance-agent.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { PuttExplorer } from "./explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Putt Explorer — PGA Tour synkeprosent per avstand | AK Golf Stats",
  description:
    "Hvor mange treffer en PGA Tour-spiller fra 3 meter? Se synkeprosent fra 1–20 meter og sammenlign med din egen putting. Basert på Broadie-data.",
  alternates: {
    canonical: "https://akgolf.no/stats/pga/putt-explorer",
  },
};

const YEAR = new Date().getUTCFullYear();

async function hentPuttData() {
  return prisma.pgaPuttDistance.findMany({
    where: { year: YEAR },
    orderBy: { distanceMeters: "asc" },
    select: {
      distanceMeters: true,
      tourAvgSunkPct: true,
      top10AvgSunkPct: true,
      proximityNext: true,
      source: true,
    },
  });
}

export default async function PuttExplorerPage() {
  const puttData = await hentPuttData();

  const harData = puttData.length > 0;

  return (
    <div className="bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            href="/stats/pga"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til PGA Tour Stats
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <AthleticEyebrow tone="lime">
              <Target className="mr-1.5 inline h-3 w-3" />
              PGA Tour · Putt Explorer
            </AthleticEyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Hvor mange{" "}
              <em className="font-normal italic text-primary">synker</em> de?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.6] text-muted-foreground md:text-[18px]">
              Putting er der store runder forsvinner. Se nøyaktig hva PGA
              Tour-snittet er fra 1 til 20 meter — og forstå hva som skiller
              topp 10 fra resten.
            </p>

            {harData && (
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
                <HeroStat
                  label="Fra 3 meter"
                  value={`${puttData.find((p) => p.distanceMeters === 3)?.tourAvgSunkPct ?? 82}%`}
                  sub="Tour-snitt synket"
                />
                <HeroStat
                  label="Fra 5 meter"
                  value={`${puttData.find((p) => p.distanceMeters === 5)?.tourAvgSunkPct ?? 51}%`}
                  sub="Tour-snitt synket"
                />
                <HeroStat
                  label="Fra 10 meter"
                  value={`${puttData.find((p) => p.distanceMeters === 10)?.tourAvgSunkPct ?? 23}%`}
                  sub="Tour-snitt synket"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interaktiv del */}
      {!harData ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
          <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Data er på vei
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Kjør cron-agenten pga-putt-distance for å seede data.
            </p>
          </div>
        </section>
      ) : (
        <PuttExplorer data={puttData} />
      )}

      {/* PlayerHQ konverteringsbanner */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <AthleticEyebrow tone="lime">Tren putting med data</AthleticEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Hva er{" "}
            <em className="font-normal italic">din</em> synkeprosent?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Logg putter i PlayerHQ etter hver runde. Se din faktiske synkeprosent
            fra ulike avstander, sammenlign med PGA Tour-benchmark, og få
            AI-coach-tips for å forbedre korte putter.
          </p>
          <div className="mt-6">
            <Link
              href="/playerhq"
              className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90"
            >
              Prøv PlayerHQ gratis i 30 dager
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
