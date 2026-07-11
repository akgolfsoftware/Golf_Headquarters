/**
 * /stats/verktoy/whs-kalkulator — v2. Swap av (mlegacy)-motparten.
 */
import type { Metadata } from "next";
import { WhsKalkulatorV2 } from "@/components/marketing/v2/MarkedStatsVerktoyV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "WHS-kalkulator | AK Golf Stats",
  description: "Beregn WHS-handicap fra dine 8 beste runder av siste 20. Offisiell NHF-metode.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/whs-kalkulator" },
};

export default function WhsKalkulatorPage() {
  return <WhsKalkulatorV2 />;
}
