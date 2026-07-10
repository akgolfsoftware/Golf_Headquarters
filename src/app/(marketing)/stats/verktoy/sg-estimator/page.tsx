/**
 * /stats/verktoy/sg-estimator — v2. Swap av (mlegacy)-motparten.
 */
import type { Metadata } from "next";
import { SgEstimatorV2 } from "@/components/marketing/v2/MarkedStatsVerktoyV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "SG-estimator | AK Golf Stats",
  description: "Estimer Strokes Gained-fordeling fra din snittscore. Broadie-basert analyse.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/sg-estimator" },
};

export default function SgEstimatorPage() {
  return <SgEstimatorV2 />;
}
