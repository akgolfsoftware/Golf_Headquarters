/**
 * /stats/pga/sg-total — interaktiv toppliste + slider
 *
 * Viser PGA Tour-spillere rangert på Strokes Gained Total, med:
 * - Topp 20-liste
 * - Distribusjonsgraf
 * - Interaktiv slider: "hva er din SG:Total?" → ser percentile + nærmeste proff
 * - Konverteringsbanner mot PlayerHQ
 *
 * ISR med 1 times revalidate.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Gauge } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { SgTotalExplorer } from "./explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Strokes Gained: Total — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem vinner flest strokes på PGA Tour? Topp 20-liste, fordeling og interaktiv sammenligning. Sjekk din SG:Total mot proffene.",
  openGraph: {
    title: "Strokes Gained: Total — PGA Tour 2026 | AK Golf Stats",
    description:
      "Interaktiv sammenligning av Strokes Gained Total mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/sg-total",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
  alternates: { canonical: "https://akgolf.no/stats/pga/sg-total" },
};

const TOUR = "pga";
const YEAR = new Date().getUTCFullYear();
const MIN_ROUNDS = 20;

function formatSg(v: number): string {
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

async function hentSgTotal() {
  const rows = await prisma.pgaPlayerSeason.findMany({
    where: {
      tour: TOUR,
      year: YEAR,
      rounds: { gte: MIN_ROUNDS },
      sgTotal: { not: null },
    },
    orderBy: { sgTotal: "desc" },
    select: {
      dgPlayerId: true,
      playerName: true,
      country: true,
      rounds: true,
      sgTotal: true,
    },
  });
  return rows;
}

export default async function SgTotalPage() {
  const players = await hentSgTotal();

  const datapunkter = players
    .filter((p) => p.sgTotal !== null)
    .map((p) => ({
      navn: p.playerName,
      land: p.country,
      verdi: p.sgTotal as number,
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
              <Gauge className="mr-1.5 inline h-3 w-3" />
              PGA Tour · Strokes Gained Total
            </AthleticEyebrow>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Hvem vinner mest{" "}
              <em className="font-normal italic text-primary">strokes</em>?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.6] text-muted-foreground md:text-[18px]">
              Strokes Gained er det mest avanserte målet i moderne golf-analyse
              — det viser hvem som faktisk er bedre enn Tour-snittet, og med
              hvor mye per runde.
            </p>

            {harData && tourSnitt !== null && tourMaks !== null && (
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
                <Stat
                  label="Tour-snitt"
                  value={formatSg(tourSnitt)}
                  enhet=""
                />
                <Stat
                  label="Beste proff"
                  value={formatSg(tourMaks)}
                  enhet=""
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
        <SgTotalExplorer datapunkter={datapunkter} />
      )}

      {/* PLAYERHQ MERSALG */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <AthleticEyebrow tone="lime">Følg din egen Strokes Gained</AthleticEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Vil du vite{" "}
            <em className="font-normal italic">nøyaktig</em> hva du taper slag på?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            PlayerHQ beregner Strokes Gained for deg basert på dine runder.
            Se nøyaktig hvilke deler av spillet som koster deg slag, og få
            AI-coach-tips målrettet mot dine svakheter.
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
