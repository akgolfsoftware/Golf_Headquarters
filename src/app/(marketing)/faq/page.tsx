/**
 * Marketing FAQ (v2, retning C). Offentlig: ingen auth-guard (markedsflate).
 * Marketing har egen chrome (MRamme) i komponenten.
 */

import type { Metadata } from "next";
import { MarkedFaqV2 } from "@/components/marketing/v2/MarkedFaqV2";

export const metadata: Metadata = {
  title: "Ofte stilte spørsmål · AK Golf Academy",
  description:
    "Svar på de vanligste spørsmålene om coaching, booking, PlayerHQ og praktisk informasjon.",
};

export default function FaqPage() {
  return <MarkedFaqV2 />;
}
