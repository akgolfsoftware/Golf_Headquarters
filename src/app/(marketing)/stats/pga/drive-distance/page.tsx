/**
 * /stats/pga/drive-distance — pixel-perfect PGA kategori-detalj (design 03)
 *
 * Bruker PgaKategoriDetaljPage-template med drive-distance config.
 * Data: getPgaTopN + getPgaTourAverage fra pga-sync.ts.
 *
 * ISR 1 time.
 */

import "./../../pga.css";
import "./../_shared/kategori.css";

import type { Metadata } from "next";
import {
  getPgaTopN,
  getPgaTourAverage,
} from "@/lib/stats/pga-sync";
import { PgaKategoriDetaljPage } from "@/components/stats/pga-kategori-page";
import type { RelatertKategori } from "@/components/stats/pga-kategori-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Drive Distance — PGA Tour 2026 | AK Golf Stats",
  description:
    "Hvor langt slår en PGA Tour-spiller? Interaktiv slider: se din percentile og nærmeste proff. Topp 20-liste + historisk fordeling.",
  alternates: { canonical: "https://akgolf.no/stats/pga/drive-distance" },
  openGraph: {
    title: "Drive Distance — PGA Tour 2026 | AK Golf Stats",
    description: "Interaktiv sammenligning av drive distance mot PGA Tour-spillere.",
    url: "https://akgolf.no/stats/pga/drive-distance",
    siteName: "AK Golf Stats",
    locale: "nb_NO",
    type: "website",
  },
};

const RELATERTE: RelatertKategori[] = [
  { slug: "fairway-pct", navn: "Fairway-treff", icon: "Target", enhet: "%", snitt: null },
  { slug: "gir-pct", navn: "Greens in Regulation", icon: "Flag", enhet: "%", snitt: null },
  { slug: "putts-per-round", navn: "Putter per runde", icon: "Circle", enhet: "", snitt: null },
  { slug: "scoring-avg", navn: "Scoring average", icon: "BarChart2", enhet: "", snitt: null },
  { slug: "sg-total", navn: "SG Total", icon: "TrendingUp", enhet: "", snitt: null },
];

export default async function DriveDistancePage() {
  const [topp, snittData] = await Promise.all([
    getPgaTopN("driveDist", { limit: 100 }),
    getPgaTourAverage("driveDist"),
  ]);

  // Hent alle spillere (ikke bare topp) for histogram og percentile
  const alleSpillere = topp.map((p) => ({
    navn: p.playerName,
    land: p.country,
    verdi: p.driveDist as number,
  }));

  const relaterte: RelatertKategori[] = RELATERTE;

  return (
    <div className="pga-page bg-background text-foreground">
      <PgaKategoriDetaljPage
        config={{
          slug: "drive-distance",
          noun: "Drive Distance",
          icon: "Zap",
          enhet: "yds",
          reverse: false,
          sliderMin: 220,
          sliderMax: 340,
          sliderDefault: 268,
          sliderStep: 1,
          heroHeadline: (
            <>
              Hvor <em className="italic-accent">langt</em> slår de?
            </>
          ),
          heroSub:
            "Drive distance er den mest synlige statistikken på Tour — og en av de største skillene mellom topp 10 og bunn 50. Lek deg med slideren og se hvor du står.",
          mersalgTekst:
            "Hvordan slår du i sommer? PlayerHQ logger drive distance på hver runde. Se utviklingen over sesongen og få AI-coach-tips for å slå lenger.",
          mersalgKort: [
            "Logger drive distance per runde automatisk",
            "Sammenlign med PGA Tour-benchmark",
            "Personlig speed-treningsplan fra AI-coach",
          ],
          relaterte,
        }}
        spillere={alleSpillere}
        tourSnitt={snittData.average}
        antallSpillere={snittData.count}
      />
    </div>
  );
}
