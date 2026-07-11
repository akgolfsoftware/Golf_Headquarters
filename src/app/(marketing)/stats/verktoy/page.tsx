/**
 * /stats/verktoy — hub (v2). Swap av (mlegacy)/stats/verktoy/page.tsx.
 * Statisk innhold, ISR 24t — kun presentasjon byttet til StatsRamme.
 */
import type { Metadata } from "next";
import { VerktoyHubV2 } from "@/components/marketing/v2/MarkedStatsVerktoyV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Golf-verktøy | AK Golf Stats",
  description:
    "Score til HCP, Tour-ekvivalent, WHS-kalkulator, SG-estimator og avstandskonverter. Gratis verktøy fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy" },
  openGraph: {
    title: "Golf-verktøy | AK Golf Stats",
    description: "5 gratis verktøy: Score-til-HCP, Tour-ekvivalent, WHS, SG-estimator, avstand.",
    url: "https://akgolf.no/stats/verktoy",
  },
};

export default function VerktoyHubPage() {
  return <VerktoyHubV2 />;
}
