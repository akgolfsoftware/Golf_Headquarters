/**
 * /stats/verktoy/avstand
 *
 * Yards ↔ meter konverter med kontekst for golfspenninger.
 */

import "../../stats.css";
import type { Metadata } from "next";
import { AvstandClient } from "./client";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Avstandskonverter | AK Golf Stats",
  description: "Konverter yards til meter og omvendt. Med kontekst for golfspenninger.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/avstand" },
};

export default function AvstandPage() {
  return <AvstandClient />;
}
