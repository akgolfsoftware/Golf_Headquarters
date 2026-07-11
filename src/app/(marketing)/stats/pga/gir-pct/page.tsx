/**
 * /stats/pga/gir-pct — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med GIR config.
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
  title: "Greens in Regulation: PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvor mange greens i regulation klarer PGA Tour-spillerne? Interaktiv slider, percentile og topp 20. GIR er statistikken som forutsier nesten alt.",
  alternates: { canonical: "https://akgolf.no/stats/pga/gir-pct" },
  openGraph: {
    title: "Greens in Regulation: PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv GIR-sammenligning mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/gir-pct",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const RELATERTE: RelatertKategori[] = [
  { slug: "drive-distance", navn: "Drive Distance", icon: "Zap", enhet: "yds", snitt: null },
  { slug: "fairway-pct", navn: "Fairway-treff", icon: "Target", enhet: "%", snitt: null },
  { slug: "putts-per-round", navn: "Putter per runde", icon: "Circle", enhet: "", snitt: null },
  { slug: "scoring-avg", navn: "Scoring average", icon: "BarChart2", enhet: "", snitt: null },
  { slug: "sg-total", navn: "SG Total", icon: "TrendingUp", enhet: "", snitt: null },
];

export default async function GirPctPage() {
  const [topp, snittData] = await Promise.all([
    getPgaTopN("girPct", { limit: 100 }),
    getPgaTourAverage("girPct"),
  ]);

  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.girPct as number,
  }));

  return (
    <StatsLegacyShell>
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "gir-pct",
          noun: "Greens in Regulation",
          icon: "Flag",
          enhet: "%",
          reverse: false,
          sliderMin: 20,
          sliderMax: 80,
          sliderDefault: 50,
          sliderStep: 1,
          heroHeadline: (
            <>
              Hvor mange greens i regulation klarer du{" "}
              <em className="italic-accent">egentlig</em>?
            </>
          ),
          heroSub:
            "GIR er den ene statistikken som forutsier nesten alt: scoring average, SG approach og antall birdie-muligheter. Se hvor du ligger an mot proffer.",
          mersalgTekst:
            "GIR er den ene statistikken som forutsier nesten alt. Logg den i PlayerHQ, se trenden over tid og forstå hvorfor du scorer som du gjør.",
          mersalgKort: [
            "Logger GIR per hull automatisk",
            "Beregner SG Approach fra GIR-data",
            "Viser hvilke hull du taper flest strokes",
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
