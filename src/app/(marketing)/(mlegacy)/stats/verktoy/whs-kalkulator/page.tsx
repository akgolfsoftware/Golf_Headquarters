/**
 * /stats/verktoy/whs-kalkulator
 *
 * Bruker legger inn opptil 20 runder (score + slope + CR).
 * Beregner WHS-handicap: 8 beste score differentials av siste 20.
 */

import "../../stats.css";
import type { Metadata } from "next";
import { WhsKalkulatorClient } from "./client";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "WHS-kalkulator | AK Golf Stats",
  description: "Beregn WHS-handicap fra dine 8 beste runder av siste 20. Offisiell NHF-metode.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/whs-kalkulator" },
};

export default function WhsKalkulatorPage() {
  return <WhsKalkulatorClient />;
}
