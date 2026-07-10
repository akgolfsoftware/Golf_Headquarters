/**
 * /stats/verktoy/sg-estimator
 *
 * Input: snittscore slider → output: SG-fordeling per kategori + radar.
 */

import "../../stats.css";
import type { Metadata } from "next";
import { SgEstimatorClient } from "./client";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "SG-estimator | AK Golf Stats",
  description: "Estimer Strokes Gained-fordeling fra din snittscore. Broadie-basert analyse.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/sg-estimator" },
};

export default function SgEstimatorPage() {
  return <SgEstimatorClient />;
}
