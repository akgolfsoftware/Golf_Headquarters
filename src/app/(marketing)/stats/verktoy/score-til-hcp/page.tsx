/**
 * /stats/verktoy/score-til-hcp — v2. Swap av (mlegacy)-motparten.
 */
import type { Metadata } from "next";
import { ScoreTilHcpV2 } from "@/components/marketing/v2/MarkedStatsVerktoyV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Score til HCP-kalkulator | AK Golf Stats",
  description:
    "Estimer HCP fra din gjennomsnittlige brutto-score. Broadie-basert, øyeblikkelig resultat.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/score-til-hcp" },
  openGraph: {
    title: "Score til HCP-kalkulator | AK Golf Stats",
    description: "Skriv inn snittscoren din, få estimert HCP basert på Broadie-data.",
    url: "https://akgolf.no/stats/verktoy/score-til-hcp",
  },
};

export default function ScoreTilHcpPage() {
  return <ScoreTilHcpV2 />;
}
