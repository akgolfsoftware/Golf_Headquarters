/**
 * /stats/pga/gir-pct — interaktiv toppliste + slider
 *
 * Viser PGA Tour-spillere rangert på greener i reguleringen (GiR), med:
 * - Topp 20-liste
 * - Distribusjonsgraf
 * - Interaktiv slider: "hvor mange greener treffer DU?" → ser percentile + nærmeste proff
 * - Konverteringsbanner mot PlayerHQ
 *
 * ISR med 1 times revalidate.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Crosshair } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { GirPctExplorer } from "./explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Greener i Regulering (GiR) — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem treffer flest greener på PGA Tour? Topp 20-liste, fordeling og interaktiv sammenligning. Sjekk din GiR-prosent mot proffene.",
  openGraph: {
    title: "Greener i Regulering (GiR) — PGA Tour 2026 | AK Golf Stats",
    description:
      "Interaktiv sammenligning av GiR-prosent mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/gir-pct",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
  alternates: { canonical: "https://akgolf.no/stats/pga/gir-pct" },
};

const TOUR = "pga";
const YEAR = new Date().getUTCFullYear();
const MIN_ROUNDS = 20;

async function hentGirPct() {
  const rows = await prisma.pgaPlayerSeason.findMany({
    where: {
      tour: TOUR,
      year: YEAR,
      rounds: { gte: MIN_ROUNDS },
      girPct: { not: null },
    },
    orderBy: { girPct: "desc" },
    select: {
      dgPlayerId: true,
      playerName: true,
      country: true,
      rounds: true,
      girPct: true,
    },
  });
  return rows;
}

export default async function GirPctPage() {
  const players = await hentGirPct();

  const datapunkter = players
    .filter((p) => p.girPct !== null)
    .map((p) => ({
      navn: p.playerName,
      land: p.country,
      verdi: p.girPct as number,
    }));

  const harData = datapunkter.length > 0;
  const tourSnitt = harData
    ? datapunkter.reduce((sum, p) => sum + p.verdi, 0) / datapunkter.length
    : null;
  const tourMaks = harData ? Math.max(...datapunkter.map((p) => p.verdi)) : null;

  return (
    <div className="bg-background text-foreground">
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

      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <AthleticEyebrow tone="lime">
              <Crosshair className="mr-1.5 inline h-3 w-3" />
              PGA Tour · Greener i Regulering
            </AthleticEyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Hvem treffer flest{" "}
              <em className="font-normal italic text-primary">greener</em>?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.6] text-muted-foreground md:text-[18px]">
              GiR er kanskje den beste indikatoren på ball-striking-kvalitet.
              Se hvem som konsekvent legger ballen på grønt.
            </p>

            {harData && tourSnitt && tourMaks && (
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
                <Stat
                  label="Tour-snitt"
                  value={tourSnitt.toFixed(1)}
                  enhet="%"
                />
                <Stat
                  label="Beste proff"
                  value={tourMaks.toFixed(1)}
                  enhet="%"
                />
                <Stat
                  label="Antall spillere"
                  value={datapunkter.length.toString()}
                  enhet=""
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {!harData ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
          <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Data er på vei
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ukentlig sync fra DataGolf starter snart. Snart kan du
              sammenligne deg med PGA Tour-spillere.
            </p>
          </div>
        </section>
      ) : (
        <GirPctExplorer datapunkter={datapunkter} />
      )}

      {/* PLAYERHQ MERSALG */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <AthleticEyebrow tone="lime">Følg din egen GiR-prosent</AthleticEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Treffer du nok{" "}
            <em className="font-normal italic">greener</em>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Logg GiR på hver runde i PlayerHQ. Se utvikling over sesongen,
            sammenlign med PGA Tour-benchmark, og få AI-coach-tips for å
            forbedre approach-spillet ditt.
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

function Stat({
  label,
  value,
  enhet,
}: {
  label: string;
  value: string;
  enhet: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
        {enhet && (
          <span className="ml-1 text-sm text-muted-foreground">{enhet}</span>
        )}
      </p>
    </div>
  );
}
