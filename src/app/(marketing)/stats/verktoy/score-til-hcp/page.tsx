/**
 * /stats/verktoy/score-til-hcp
 *
 * Input: snittscore slider → output: estimert HCP + kontekst.
 * Bruker hcpFromAvgScore() fra sg-estimator.ts.
 * Client component (interaktiv slider).
 */

import "../../stats.css";
import type { Metadata } from "next";
import { ScoreTilHcpClient } from "./client";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Score til HCP-kalkulator | AK Golf Stats",
  description:
    "Estimer HCP fra din gjennomsnittlige brutto-score. Broadie-basert, øyeblikkelig resultat.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/score-til-hcp" },
  openGraph: {
    title: "Score til HCP-kalkulator — AK Golf Stats",
    description: "Skriv inn snittscoren din, få estimert HCP basert på Broadie-data.",
    url: "https://akgolf.no/stats/verktoy/score-til-hcp",
  },
};

export default function ScoreTilHcpPage() {
  return <ScoreTilHcpClient />;
}
