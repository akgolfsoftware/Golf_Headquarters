/**
 * /stats/pga/fairway-pct — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med fairway-pct config.
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
  title: "Fairway Accuracy — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem treffer flesteparten av fairwayene på PGA Tour? Interaktiv slider, topp 20-liste og personlig percentile-analyse.",
  alternates: { canonical: "https://akgolf.no/stats/pga/fairway-pct" },
  openGraph: {
    title: "Fairway Accuracy — PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv sammenligning av fairway-treff mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/fairway-pct",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const RELATERTE: RelatertKategori[] = [
  { slug: "drive-distance", navn: "Drive Distance", icon: "Zap", enhet: "yds", snitt: null },
  { slug: "gir-pct", navn: "Greens in Regulation", icon: "Flag", enhet: "%", snitt: null },
  { slug: "putts-per-round", navn: "Putter per runde", icon: "Circle", enhet: "", snitt: null },
  { slug: "scoring-avg", navn: "Scoring average", icon: "BarChart2", enhet: "", snitt: null },
  { slug: "sg-total", navn: "SG Total", icon: "TrendingUp", enhet: "", snitt: null },
];

export default async function FairwayPctPage() {
  const [topp, snittData] = await Promise.all([
    getPgaTopN("fairwayPct", { limit: 100 }),
    getPgaTourAverage("fairwayPct"),
  ]);

  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.fairwayPct as number,
  }));

  return (
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "fairway-pct",
          noun: "Fairway-treff",
          icon: "Target",
          enhet: "%",
          reverse: false,
          sliderMin: 30,
          sliderMax: 85,
          sliderDefault: 55,
          sliderStep: 1,
          heroHeadline: (
            <>
              Hvem treffer <em className="italic-accent">flesteparten</em> av
              fairwayene?
            </>
          ),
          heroSub:
            "Fairway-treff er en nøkkelindikator for ball-striking og posisjonsspill. Tour-snittet skiller seg overraskende lite fra top-spillerne. Se hvor du ligger an.",
          mersalgTekst:
            "Treffer du flere fairways enn forrige sesong? PlayerHQ holder regnskap så du slipper og viser trenden over tid.",
          mersalgKort: [
            "Logger fairway-treff per runde",
            "Viser ukentlig trend og sesongutvikling",
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
