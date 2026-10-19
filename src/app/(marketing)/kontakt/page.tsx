/**
 * Kontakt (/kontakt) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 * Skjemaets server-handling ligger i ./actions.ts.
 */

import type { Metadata } from "next";
import { KontaktPrecision } from "@/components/marketing/ds-sider/KontaktPrecision";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt AK Golf Academy",
  description:
    "Skriv til AK Golf Academy om coaching, juniorgruppene, PlayerHQ eller et opplegg for bedriften, eller ring direkte.",
  formatDetection: { telephone: true },
};

export default function KontaktPage() {
  return <KontaktPrecision />;
}
