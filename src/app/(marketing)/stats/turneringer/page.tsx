/**
 * /stats/turneringer — Turneringsoversikt (v2, retning C)
 * Swap av (mlegacy)/stats/turneringer/page.tsx → v2-utseende. Data-lag
 * (hentTurneringerForListe, hentTurneringCounts, hentNorskeDenneUka) er 1:1
 * videreført fra legacy-siden; kun presentasjonen er byttet til
 * StatsRamme/StatsListe + StatsTurneringerV2.
 */
import type { Metadata } from "next";
import {
  hentTurneringerForListe,
  hentTurneringCounts,
  hentNorskeDenneUka,
  type TourFilter,
  type TidFilter,
} from "@/lib/stats/turnering-queries";
import { StatsTurneringerV2 } from "@/components/marketing/v2/StatsTurneringerV2";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Turneringer | AK Golf Stats",
  description:
    "PGA, DP World, Korn Ferry, norske amatør- og junior-turneringer. Live-data, norske spillere fremhevet.",
  alternates: { canonical: "https://akgolf.no/stats/turneringer" },
  openGraph: {
    title: "Turneringer | AK Golf Stats",
    description:
      "Alle golftturneringer samlet. Norske deltakere fremhevet på tvers av PGA Tour, DP World Tour, Korn Ferry og norske tourer.",
    url: "https://akgolf.no/stats/turneringer",
    type: "website",
  },
};

function validerTour(raw: string | undefined): TourFilter {
  const GYLDIGE: TourFilter[] = ["alle", "pga", "euro", "kft", "lpga", "let", "challenge", "norge", "junior", "college"];
  return GYLDIGE.includes(raw as TourFilter) ? (raw as TourFilter) : "alle";
}

function validerTid(raw: string | undefined): TidFilter {
  const GYLDIGE: TidFilter[] = ["uke", "kommende", "avsluttede"];
  return GYLDIGE.includes(raw as TidFilter) ? (raw as TidFilter) : "uke";
}

type Props = { searchParams: Promise<{ tour?: string; tid?: string }> };

export default async function TurneringerPage({ searchParams }: Props) {
  const params = await searchParams;
  const tour = validerTour(params.tour);
  const tid = validerTid(params.tid);

  const [turneringer, counts, norskeDenneUka] = await Promise.all([
    hentTurneringerForListe(tour, tid),
    hentTurneringCounts(),
    tid === "uke" ? hentNorskeDenneUka() : Promise.resolve([]),
  ]);

  const totaltNorske = norskeDenneUka.reduce((sum, t) => sum + t.spillere.length, 0);
  const antallTurneringerMedNorske = norskeDenneUka.length;
  const harNoenTurneringer = counts.alle > 0;

  return (
    <StatsTurneringerV2
      tour={tour}
      tid={tid}
      turneringer={turneringer}
      counts={counts}
      totaltNorske={totaltNorske}
      antallTurneringerMedNorske={antallTurneringerMedNorske}
      harNoenTurneringer={harNoenTurneringer}
    />
  );
}
