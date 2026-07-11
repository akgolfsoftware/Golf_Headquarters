/**
 * /stats/verktoy/avstand — v2. Swap av (mlegacy)/stats/verktoy/avstand/page.tsx.
 */
import type { Metadata } from "next";
import { AvstandV2 } from "@/components/marketing/v2/MarkedStatsVerktoyV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Avstandskonverter | AK Golf Stats",
  description: "Konverter yards til meter og omvendt. Med kontekst for golfspenninger.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/avstand" },
};

export default function AvstandPage() {
  return <AvstandV2 />;
}
