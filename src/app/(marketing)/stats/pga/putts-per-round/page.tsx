/**
 * /stats/pga/putts-per-round — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med putts-per-round config.
 * Reverse = true (færre = bedre).
 * ISR 1 time.
 */

import "./../pga.css";
import "./../_shared/kategori.css";

import type { Metadata } from "next";
import { getPgaTopN, getPgaTourAverage } from "@/lib/stats/pga-sync";
import { PgaKategoriDetaljPage } from "@/components/stats/pga-kategori-page";
import type { RelatertKategori } from "@/components/stats/pga-kategori-page";
import { StatsLegacyShell } from "@/components/marketing/v2/stats-ramme";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Putts Per Round: PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem putter aller best på PGA Tour? Se topp 20 (færrest putter per runde), interaktiv percentile-analyse og sammenlign med din egen putting.",
  alternates: { canonical: "https://akgolf.no/stats/pga/putts-per-round" },
  openGraph: {
    title: "Putts Per Round: PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv putting-sammenligning mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/putts-per-round",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const RELATERTE: RelatertKategori[] = [
  { slug: "drive-distance", navn: "Drive Distance", icon: "Zap", enhet: "yds", snitt: null },
  { slug: "fairway-pct", navn: "Fairway-treff", icon: "Target", enhet: "%", snitt: null },
  { slug: "gir-pct", navn: "Greens in Regulation", icon: "Flag", enhet: "%", snitt: null },
  { slug: "scoring-avg", navn: "Scoring average", icon: "BarChart2", enhet: "", snitt: null },
  { slug: "sg-total", navn: "SG Total", icon: "TrendingUp", enhet: "", snitt: null },
];

export default async function PuttsPerRoundPage() {
  const [topp, snittData] = await Promise.all([
    getPgaTopN("puttsPerRound", { limit: 100 }),
    getPgaTourAverage("puttsPerRound"),
  ]);

  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.puttsPerRound as number,
  }));

  return (
    <StatsLegacyShell>
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "putts-per-round",
          noun: "Putter per runde",
          icon: "Circle",
          enhet: "",
          reverse: true,
          sliderMin: 24,
          sliderMax: 36,
          sliderDefault: 30,
          sliderStep: 0.1,
          heroHeadline: (
            <>
              Hvem putter <em className="italic-accent">aller best</em>?
            </>
          ),
          heroSub:
            "30 putter i runden bør ned til 28. PGA Tour-snittet er overraskende lavt, og det er en av de statistikkene du faktisk kan forbedre mest med øving.",
          mersalgTekst:
            "30 putter i runden bør ned til 28. PlayerHQ regner ut SG Putting per runde og viser hvor du faktisk taper strokes.",
          mersalgKort: [
            "Logger antall putter per hull",
            "Beregner SG Putting automatisk",
            "Viser synket-prosent per avstand",
          ],
          relaterte: RELATERTE,
        }}
        spillere={alleSpillere}
        tourSnitt={snittData.average}
        antallSpillere={snittData.count}
      />
    </div>
    </StatsLegacyShell>
  );
}
