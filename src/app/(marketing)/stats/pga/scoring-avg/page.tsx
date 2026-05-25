/**
 * /stats/pga/scoring-avg — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med scoring-avg config.
 * Reverse = true (lavere = bedre).
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
  title: "Scoring Average — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvem scorer lavest per runde på PGA Tour? Interaktiv slider, percentile-analyse og topp 20. Se hva som skiller de beste fra resten.",
  alternates: { canonical: "https://akgolf.no/stats/pga/scoring-avg" },
  openGraph: {
    title: "Scoring Average — PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv scoring average-sammenligning mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/scoring-avg",
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
  { slug: "sg-total", navn: "SG Total", icon: "TrendingUp", enhet: "", snitt: null },
];

export default async function ScoringAvgPage() {
  const [topp, snittData] = await Promise.all([
    getPgaTopN("avgScore", { limit: 100 }),
    getPgaTourAverage("avgScore"),
  ]);

  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.avgScore as number,
  }));

  return (
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "scoring-avg",
          noun: "Scoring average",
          icon: "BarChart2",
          enhet: "",
          reverse: true,
          sliderMin: 65,
          sliderMax: 85,
          sliderDefault: 78,
          sliderStep: 0.1,
          heroHeadline: (
            <>
              Hvem scorer <em className="italic-accent">lavest</em> per runde?
            </>
          ),
          heroSub:
            "Snittscoren på PGA Tour er tettere enn du tror — de beste scorer bare 2–3 slag under de dårligste. Men de 2 slagene er alt. Se hvor du er.",
          mersalgTekst:
            "Snittscoren din viser ikke hvor du taper strokes. PlayerHQ med SG-analyse gjør — og viser deg nøyaktig hva som må jobbes med.",
          mersalgKort: [
            "Logger score per hull og runde",
            "Beregner SG mot referansespiller",
            "Identifiserer hull du taper mest på",
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
