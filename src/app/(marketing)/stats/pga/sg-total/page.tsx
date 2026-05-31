/**
 * /stats/pga/sg-total — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med SG Total config.
 * ISR 1 time.
 */

import "./../pga.css";
import "./../_shared/kategori.css";

import type { Metadata } from "next";
import { getPgaTopN, getPgaTourAverage } from "@/lib/stats/pga-sync";
import { PgaKategoriDetaljPage } from "@/components/stats/pga-kategori-page";
import type { RelatertKategori } from "@/components/stats/pga-kategori-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SG Total — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem vinner mest strokes mot Tour-snittet? Interaktiv SG Total-analyse, percentile og topp 20. Strokes Gained er det presiseste målet på golf-ferdighet.",
  alternates: { canonical: "https://akgolf.no/stats/pga/sg-total" },
  openGraph: {
    title: "SG Total — PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv Strokes Gained Total-sammenligning mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/sg-total",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const RELATERTE: RelatertKategori[] = [
  { slug: "drive-distance", navn: "Drive Distance", icon: "Zap", enhet: "yds", snitt: null },
  { slug: "fairway-pct", navn: "Fairway-treff", icon: "Target", enhet: "%", snitt: null },
  { slug: "gir-pct", navn: "Greens in Regulation", icon: "Flag", enhet: "%", snitt: null },
  { slug: "putts-per-round", navn: "Putter per runde", icon: "Circle", enhet: "", snitt: null },
  { slug: "scoring-avg", navn: "Scoring average", icon: "BarChart2", enhet: "", snitt: null },
];

export default async function SgTotalPage() {
  // DataGolf skill-ratings har rounds=null → minRounds:0 dropper rounds-filteret.
  const [topp, snittData] = await Promise.all([
    getPgaTopN("sgTotal", { limit: 100, minRounds: 0 }),
    getPgaTourAverage("sgTotal", { minRounds: 0 }),
  ]);

  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.sgTotal as number,
  }));

  return (
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "sg-total",
          noun: "SG Total",
          icon: "TrendingUp",
          enhet: "",
          reverse: false,
          sliderMin: -5,
          sliderMax: 5,
          sliderDefault: -2,
          sliderStep: 0.1,
          heroHeadline: (
            <>
              Hvem vinner <em className="italic-accent">mest</em> strokes mot
              Tour-snittet?
            </>
          ),
          heroSub:
            "Strokes Gained Total er det mest presise målet på golf-ferdighet. Det forteller nøyaktig hvor mye bedre (eller dårligere) en spiller er enn Tour-snittet per runde.",
          mersalgTekst:
            "Verdens beste vinner +3 SG per runde. Du? PlayerHQ måler det automatisk når du logger runder — og viser nøyaktig hvilke kategorier du taper strokes på.",
          mersalgKort: [
            "Automatisk SG-beregning per runde",
            "Breakdown: OTT, approach, putting",
            "Sammenlign med PGA Tour-benchmark",
          ],
          relaterte: RELATERTE,
        }}
        spillere={alleSpillere}
        tourSnitt={snittData.average}
        antallSpillere={snittData.count}
      />
    </div>
  );
}
